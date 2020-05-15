import { Controller, Post, Body, UseInterceptors, UploadedFiles, Get, Param, Put, UploadedFile, Delete, Res } from "@nestjs/common";
import { ProduitsService } from "./produits.service";
import { ProduitsDto } from "./dto/produits.dto";
import { FilesInterceptor } from "@nestjs/platform-express";
import { diskStorage } from 'multer';
import { editFileName, imageFileFilter } from "src/users/file-upload.utils";

@Controller("produits")
export class ProduitsController {
  constructor(private produitsService: ProduitsService) { }

  @Get()
  public async getAllProduits() {
    const produits = await this.produitsService.findAll();
    return { produits, total: produits.length };
  }

  @Get('find')
  public async findOneProduit(@Body() body) {
    const queryCondition = body;
    const produits = await this.produitsService.findOne(queryCondition);
    return produits;
  }

  @Get('/:id')
  public async getProduit(@Param() param) {
    const produits = await this.produitsService.findById(param.id);
    return produits;
  }

  @Get('/getImage/:imgpath')
  seeUploadedFile(@Param('imgpath') images, @Res() res) {
    return res.sendFile(images, { root: "./uploads/produits" }, err => {
      if (err) {
        console.log("Image introuvable");
      }
    });
  }

  @Post()
  @UseInterceptors(
    FilesInterceptor("images", 3, {
      storage: diskStorage({
        destination: "./uploads/produits",
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    })
  )

  async create(@Body() addProduitsDto: ProduitsDto, @UploadedFiles() files) {
    const response = [];
    files.forEach((file) => {
      response.push(file.filename);
    });
    addProduitsDto.images = response;

    let data = {};
    let detail_fabrication = {};
    let detail_physique = {};
    let prix = {};

    detail_fabrication["numero_model"] = addProduitsDto.numero_model;
    detail_fabrication["date_sortie"] = addProduitsDto.date_sortie;

    detail_physique["poids"] = addProduitsDto.poids;
    detail_physique["longueur"] = addProduitsDto.longueur;
    detail_physique["largeur"] = addProduitsDto.largeur;
    detail_physique["taille"] = addProduitsDto.taille;
    detail_physique["couleur"] = addProduitsDto.couleur;

    prix["prix"] = addProduitsDto.prix;
    prix["prix_promotion"] = addProduitsDto.prix_promotion;

    data["titre"] = addProduitsDto.titre;
    data["description"] = addProduitsDto.description;
    data["categorie"] = addProduitsDto.categorie;
    data["quantite"] = addProduitsDto.quantite;
    data["images"] = addProduitsDto.images;
    data["detail_fabrication"] = detail_fabrication;
    data["detail_physique"] = detail_physique;
    data["prix"] = prix;

    return await this.produitsService.create(data);
  }

  @Put('/:id')
  public async updateProduits(@Param() param, @Body() body) {

    let detail_fabrication = {};
    let detail_physique = {};
    let prix = {};
    let vote = {};

    // if(body.numero_model ){
    //   console.log("exist");
    //   detail_fabrication["numero_model"] = body.numero_model;
    //   detail_fabrication["date_sortie"] = body.date_sortie;
    //   detail_physique["poids"] = body.poids;
    //   detail_physique["longueur"] = body.longueur;


    //}else{
    // console.log("n'existe pas");
    const produit = await this.produitsService.findById(param.id);
    console.log("produit", produit);
    // detail_fabrication["date_sortie"] = body.date_sortie != null ? body.date_sortie : 'rakoto';
    detail_fabrication["numero_model"] = body.numero_model == null ? produit.detail_fabrication['numero_model'] : body.numero_model;
    detail_fabrication["date_sortie"] = body.date_sortie == null ? produit.detail_fabrication['date_sortie'] : body.date_sortie;

    detail_physique["poids"] = body.poids == null ? produit.detail_physique['poids'] : body.poids;
    detail_physique["longueur"] = body.longueur == null ? produit.detail_physique['longueur'] : body.longueur;
    detail_physique["largeur"] = body.largeur == null ? produit.detail_physique['largeur'] : body.largeur;
    detail_physique["taille"] = body.taille == null ? produit.detail_physique['taille'] : body.taille;
    detail_physique["couleur"] = body.couleur == null ? produit.detail_physique['couleur'] : body.couleur;
    prix["prix"] = body.prix == null ? produit.prix['prix'] : body.prix;
    prix["prix_promotion"] = body.prix_promotion == null ? produit.prix['prix_promotion'] : body.prix_promotion;

    vote["id_user"] = body.vote == null ? produit.prix['id_user'] : body.vote;

    //}        

    body["detail_fabrication"] = detail_fabrication;
    body["detail_physique"] = detail_physique;
    body["prix"] = prix;

    const produits = await this.produitsService.update(param.id, body);
    return produits;
  }

  @Put('/update/imagesAdd/:id')
  @UseInterceptors(
    FilesInterceptor("images", 3, {
      storage: diskStorage({
        destination: "./uploads/produits",
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    })
  )
  public async addImages(@Param() param, @UploadedFiles() files) {
    const response = [];
    files.forEach((file) => {
      response.push(file.filename);
    });

    const produits = await this.produitsService.updateAddImage(param.id, response);
    return produits;
  }

  @Put('/update/imagesRemove/:id')
  public async deleteImages(@Param() param, @Body() body) {
    let images = [];
    images = body.images;

    const fs = require('fs-extra');
    for (var i = 0; i < images.length; i++) {
      fs.remove("./uploads/produits/" + images[i] + "", err => {
      })
    }
    const produits = await this.produitsService.updateDeleteImage(param.id, images);
    return produits;
  }

  @Put('/update/favorisAdd/:id')
  public async updateFavorisPush(@Param() param, @Body() body) {
    let array = [];
    let values = Object.values(body);
    Array.prototype.push.apply(array, values);
    const produits = await this.produitsService.updateFavorisAdd(param.id, array);
    return produits;
  }

  @Put('/update/favorisRemove/:id')
  public async updateFavorisPull(@Param() param, @Body() body) {
    let array = [];
    let values = Object.values(body);
    Array.prototype.push.apply(array, values);

    const produits = await this.produitsService.updateFavorisRemove(param.id, array[0]);
    return produits;
  }

  @Put('/update/voteAdd/:id')
  public async updateVotePush(@Param() param, @Body() body) {
    let array = [];
    let values = Object.values(body);
    Array.prototype.push.apply(array, values);
    const produits = await this.produitsService.updateVoteAdd(param.id, array);
    return produits;
  }

  @Put('/update/voteRemove/:id')
  public async updateVotePull(@Param() param, @Body() body) {
    let array = [];
    let values = Object.values(body);
    Array.prototype.push.apply(array, values);
    const produits = await this.produitsService.updateVoteRemove(param.id, array[0]);
    return produits;
  }

  @Delete('/:id')
  public async deleteProduits(@Param() param) {
    const produit = await this.produitsService.findById(param.id);
    let images = produit['images'];
    var j = images.length;
    const fs = require('fs-extra');
    for (var i = 0; i < j; i++) {
      fs.remove("./uploads/produits/" + images[i] + "", err => {
      })
      console.log("./uploads/produits/" + images[i] + "");
    }
    return this.produitsService.delete(param.id);
  }
}
