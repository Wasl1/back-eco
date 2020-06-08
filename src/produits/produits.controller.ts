import { Controller, Post, Body, UseInterceptors, UploadedFiles, Get, Param, Put, UploadedFile, Delete, Res, BadRequestException, HttpException, HttpStatus, ParseIntPipe, Query } from "@nestjs/common";
import { ProduitsService } from "./produits.service";
import { ProduitsDto } from "./dto/produits.dto";
import { FilesInterceptor } from "@nestjs/platform-express";
import { diskStorage } from 'multer';
import { editFileName, imageFileFilter } from "src/users/file-upload.utils";
import { HistoricSearchService } from "src/historic-search/historic-search.service";

import * as fs from 'fs';
import * as PdfPrinter from 'pdfmake';
import * as uuid from 'uuid/v4';

@Controller("produits")
export class ProduitsController {
  constructor(private produitsService: ProduitsService, private historicSeachService: HistoricSearchService ) {}

@Get()
public async getAllProduits() {
  const produits = await this.produitsService.findAll();
  return { produits, total: produits.length };
}

@Get('getLastProduits')
public async getLastProduits() {
  const produits = await this.produitsService.getLastProduits();
  return { produits, total: produits.length};
}

@Get('getProduitsCustomised/:page')
public async getProduitsCustomised(@Param('page', new ParseIntPipe()) page: number) {
  page = page - 1;
  const produits = await this.produitsService.getProduitsCustomised(page);
  return { produits, total: produits.length};
}

@Get('getUserWhoVoteProduit/:id_produits')
public async getUserWhoVoteProduit(@Param() param){
  const produit = await this.produitsService.getUserWhoVoteProduit(param.id_produits);
  let user = produit.vote;
  return {user, total : user.length};
}

@Get('getUserWhoFavoriteProduit/:id_produits')
public async getUserWhoFavoriteProduit(@Param() param){
  const produit = await this.produitsService.getUserWhoFavoriteProduit(param.id_produits);
  let user = produit.favoris;
  return {user, total : user.length};
}

@Get('find')
public async findProduit(@Body() body) {
  const queryCondition = body;
  const produits = await this.produitsService.find(queryCondition);
  return produits;
}

@Get('/:id')
public async getProduit(@Param() param) {
  const produits = await this.produitsService.findById(param.id);
  return produits;
}

@Get('/getImage/:imgpath')
public async getImage(@Param('imgpath') images, @Res() res) {
  return res.sendFile(images, { root: "./uploads/produits"}, err => {
  if(err){
     return res.sendFile("error.png", { root: "./uploads/produits"});
    }
  });
}

  @Get('/recherche/search')
  public async esSearch(@Query('keywords') keywords: string, @Query('id_user') id_user: number){
    let userSearch = {};
    let historicSearch= {};

    userSearch["keywords"] = keywords;
    historicSearch["keywords"] = keywords;
    historicSearch["user"] = id_user;
    historicSearch["userSearch"] = userSearch;    
      
    const results = await this.historicSeachService.addUserSearch(id_user, historicSearch).then(()=>{
      return this.produitsService.search(keywords);
    });
    return results;
  }

  @Get('/recherche/searchTitre')
  public async esSearchTitre(@Query('query') query: string){
    const results = await this.produitsService.searchTitre(query);
    return results;
  }

  @Get('/PdfGen/generatePDF')
  generatePDF() {
    const fonts = {
      Helvetica: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique'
      }
    };
    const printer = new PdfPrinter(fonts);
 
    const docDefinition = {
      content: [
        { text: 'Heading', fontSize: 25},
        {
          layout: 'lightHorizontalLines', // optional
          table: {
            headerRows: 1,
            widths: [ '*', 'auto', 100, '*' ],
 
            body: [
              [ 'First', 'Second', 'Third', 'The last one' ],
              [ 'Value 1', 'Value 2', 'Value 3', 'Value 4' ],
              [ 'Val 1','Val 2', 'Val 3', 'Val 4' ]
            ],
          },
        },
        {text: 'google', link: 'http://google.com', pageBreak: 'before',},
        { qr: 'text in QR', foreground: 'green', background: 'white' },
      ],
      defaultStyle: {
        font: 'Helvetica'
      }
    };
 
    const options = {
    }
    let file_name = 'PDF' + uuid() + '.pdf';
    const pdfDoc = printer.createPdfKitDocument(docDefinition, options);
    pdfDoc.pipe(fs.createWriteStream(file_name));
    pdfDoc.end();
    return {'file_name': file_name};
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
    let historique = [];
    let creer = {};

    detail_fabrication["numero_model"] = addProduitsDto.numero_model;
    detail_fabrication["date_sortie"] = addProduitsDto.date_sortie;

    detail_physique["poids"] = addProduitsDto.poids;
    detail_physique["longueur"] = addProduitsDto.longueur;
    detail_physique["largeur"] = addProduitsDto.largeur;
    detail_physique["taille"] = addProduitsDto.taille;
    detail_physique["couleur"] = addProduitsDto.couleur;
    
    prix["prix_normal"] = addProduitsDto.prix_normal;
    prix["prix_promotion"] = addProduitsDto.prix_promotion;

    creer["createur"] = addProduitsDto.createur;
    creer["date_creation"] = addProduitsDto.date_creation;

    historique.push({"creer": creer});

    data["titre"] = addProduitsDto.titre;
    data["description"] = addProduitsDto.description;
    data["marque"] = addProduitsDto.marque;
    data["categorie"] = addProduitsDto.categorie;
    data["quantite"] = addProduitsDto.quantite;
    data["images"] = addProduitsDto.images;
    data["detail_fabrication"] = detail_fabrication;
    data["detail_physique"] = detail_physique;
    data["etat"] = addProduitsDto.etat;
    data["prix"] = prix;
    data["garantie"] = addProduitsDto.garantie;
    data["provenance"] = addProduitsDto.provenance;
    data["historique"] = historique;
    
    return await this.produitsService.create(data);
  }

  @Put('/:id')
    public async updateProduits(@Param() param, @Body() body, @Body() vraiBody){ 
      const produit = await this.produitsService.findById(param.id);
    
      let champs = {};
      let modifier = {};
      let modificationArray = [];
      
      let key = Object.keys(vraiBody);
      for(let i = 0; i < key.length; i++){
        let OldValue = produit[key[i]];
        console.log(OldValue);
        champs[key[i]+"Old"] = (produit[key[i]] === undefined && (key[i] == "numero_model" || key[i] == "date_sortie"))  ? produit.detail_fabrication[key[i]] : (produit[key[i]] === undefined && (key[i] == "poids" || key[i] == "longueur" || key[i] == "largeur" || key[i] == "couleur" || key[i] == "taille")) ? produit.detail_physique[key[i]] : (produit[key[i]] === undefined && (key[i] == "prix_normal" || key[i] == "prix_promotion"))  ? produit.prix[key[i]] : produit[key[i]];
        champs[key[i]+"New"] = vraiBody[key[i]];
      }

      modifier["modificateur"] = vraiBody.modificateur;
      modifier["date_modification"] = vraiBody.date_modification;
      modifier["champs"] = champs;
      modificationArray.push(modifier);
      
      let detail_fabrication = {};
      let detail_physique = {};
      let prix = {};

        // if(body.numero_model ){
        //   console.log("exist");
        //   detail_fabrication["numero_model"] = body.numero_model;
        //   detail_fabrication["date_sortie"] = body.date_sortie;
        //   detail_physique["poids"] = body.poids;
        //   detail_physique["longueur"] = body.longueur;
          
        //}else{
          // console.log("n'existe pas");
          
          // detail_fabrication["date_sortie"] = body.date_sortie != null ? body.date_sortie : 'rakoto';
          detail_fabrication["numero_model"] = body.numero_model==null ? produit.detail_fabrication['numero_model'] : body.numero_model;
          detail_fabrication["date_sortie"] = body.date_sortie ==null ? produit.detail_fabrication['date_sortie'] : body.date_sortie;
          
          detail_physique["poids"] = body.poids == null ? produit.detail_physique['poids'] : body.poids;
          detail_physique["longueur"] = body.longueur==null ? produit.detail_physique['longueur'] : body.longueur;
          detail_physique["largeur"] = body.largeur==null ? produit.detail_physique['largeur'] : body.largeur;
          detail_physique["taille"] = body.taille==null ? produit.detail_physique['taille'] : body.taille;
          detail_physique["couleur"] = body.couleur==null ? produit.detail_physique['couleur'] : body.couleur;
          
          prix["prix_normal"] = body.prix_normal==null ? produit.prix['prix_normal'] : body.prix_normal;
          prix["prix_promotion"] = body.prix_promotion==null ? produit.prix['prix_promotion'] : body.prix_promotion;
         
          //}        

        body["detail_fabrication"] = detail_fabrication;
        body["detail_physique"] = detail_physique;
        body["prix"] = prix;
          
        const produits = await this.produitsService.update(param.id, body).then(()=>{
            return this.produitsService.updateModifier(param.id, modificationArray);
        });
        return produits;
    }

    @Put('/update/lancement/:id')
    public async updateLancement(@Param() param, @Body() body){
      let lancer = {};

      lancer["lanceur"] = body.lanceur;
      lancer["date_lancement"] = body.date_lancement;
      
      const produits = await this.produitsService.updateLancer(param.id, lancer);
      return produits;
    }

    @Put('/update/archive/:id')
    public async updateArchive(@Param() param, @Body() body){
      let archive = {};

      archive["archiveur"] = body.archiveur;
      archive["date_archive"] = body.date_archive;
      
      const produits = await this.produitsService.updateArchiver(param.id, archive);
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
    public async addImages(@Param() param, @UploadedFiles() files){
      const response = [];
      files.forEach((file) => {
      response.push(file.filename);
      });

      const produits = await this.produitsService.updateAddImage(param.id, response);
      return produits;
    }

    @Put('/update/imagesRemove/:id')
    public async deleteImages(@Param() param, @Body() body){
      let images = [];
      images = body.images;
            
      const fs = require('fs-extra');
        for(var i = 0; i < images.length; i++){
          fs.remove("./uploads/produits/"+images[i]+"", err => {
          })
      }
      const produits = await this.produitsService.updateDeleteImage(param.id, images);
      return produits;
    }

    @Put('/update/favorisAdd/:id')
    public async updateFavorisPush(@Param() param, @Body() body){
      let array = [];
      let values = Object.values(body);
      Array.prototype.push.apply(array, values);
      const produits = await this.produitsService.updateFavorisAdd(param.id, array);
      return produits;
    }

    @Put('/update/favorisRemove/:id')
    public async updateFavorisPull(@Param() param, @Body() body){
      let array = [];
      let values = Object.values(body);
      Array.prototype.push.apply(array, values);
      
      const produits = await this.produitsService.updateFavorisRemove(param.id, array[0]);
      return produits;
    }

    @Put('/update/voteAdd/:id')
    public async updateVotePush(@Param() param, @Body() body){
      let array = [];
      let values = Object.values(body);
      Array.prototype.push.apply(array, values);
      const produits = await this.produitsService.updateVoteAdd(param.id, array);
      return produits;
    }

    @Put('/update/voteRemove/:id')
    public async updateVotePull(@Param() param, @Body() body){
      let array = [];
      let values = Object.values(body);
      Array.prototype.push.apply(array, values);
      const produits = await this.produitsService.updateVoteRemove(param.id, array[0]);
      return produits;
    }

    @Put('/update/incrementView/:id')
    public async incrementView(@Param() param){
      const produits = await this.produitsService.incrementView(param.id);
      return produits;
    }

    @Put('/update/updateMultipleEtat')
    public async updateMultipleEtat(@Body() body){
      let id_produits = [];
      id_produits = body.id_produits;
      let etat = body.etat;
      return this.produitsService.updateMultipleEtat(id_produits, etat);
    }

    @Put('/update/decrementQuantite/:id')
    public async decrementQuantite(@Param() param, @Body() body){
      const produit = await this.produitsService.findById(param.id);

      let qteProduit = body.quantite;
      
      if(produit.quantite > qteProduit){
        qteProduit = -Math.abs(qteProduit);
      
        const produits = await this.produitsService.decrementQuantite(param.id, qteProduit);
        return produits;
      } else console.log("Stock epuisé");
      
      
    }

    @Delete('/:id')
    public async deleteProduits(@Param() param) {
        const produit = await this.produitsService.findById(param.id);
        let images = produit['images'];
        var j = images.length;
        const fs = require('fs-extra');
        for(var i = 0; i < j; i++){
          fs.remove("./uploads/produits/"+images[i]+"", err => {
          })
          console.log("./uploads/produits/"+images[i]+""); 
        }
        return this.produitsService.delete(param.id);
    }

    @Delete('/delete/deleteMultipleProduits')
    public async deleteManyProduits(@Body() body){
      let id_produits = [];
      id_produits = body.id_produits;
      let j = id_produits.length;

      for(var i = 0; i < j; i++){        
        let produit = await this.produitsService.findById(id_produits[i]);
        let images = produit['images'];
        let image_nombres = images.length;
        const fs = require('fs-extra');
        console.log("images", images);
        for(let a = 0; a < image_nombres; a++){
          fs.remove("./uploads/produits/"+images[a]+"", err => {
          })
        }        
      }
      return this.produitsService.deleteMultiple(id_produits);
    }

}
