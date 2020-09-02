import { Controller, Post, Body, Get, Param, Put, Delete, Res, HttpStatus, ParseIntPipe, Query, Request, UseGuards, HttpCode } from "@nestjs/common";
import { ProduitsService } from "./produits.service";
import { ProduitsDto } from "./dto/produits.dto";
import { HistoricSearchService } from "src/historic-search/historic-search.service";
import { printer, docDefinitionFacture } from "src/templates/template.pdf";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/auth/decorators/roles.decorator";
import { ApiBearerAuth, ApiOkResponse } from "@nestjs/swagger";
import { InjectModel } from "@nestjs/mongoose";
import { ProduitsInterface } from "./interface/produits.interface";
import { Model } from 'mongoose';
var path = require('path');
var sizeOf = require("image-size");
const fs = require('fs-extra');
var glob = require("glob");

@Controller("produits")
export class ProduitsController {
  constructor(private produitsService: ProduitsService, 
    private historicSeachService: HistoricSearchService,
    @InjectModel('Produits') private produitsModel: Model<ProduitsInterface> ) {}

@Get()
public async getAllProduits() {
  const produits = await this.produitsService.findAllProduits();
  return { produits, total: produits.length };
}

@Get('getLastProduits')
public async getLastProduits() {
  const produits = await this.produitsService.getLastProduits();
  return { produits, total: produits.length};
}

@Get('getProduitsCustomised/:page')
public async getProduitsCustomised(@Param('page', new ParseIntPipe()) page: number, @Res() res){
  let options = {
      page: page, 
      limit: 20, 
      sort: {_id: -1},
      populate: 'categorie',
  }
  return await this.produitsModel.paginate({}, options, (err, result) => {
    res.send({Produits: result.docs, TotalProduis: result.totalDocs, TotalPages: result.totalPages});
  });
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

@Get('/:id')
public async getProduit(@Param() param) {
  const produits = await this.produitsService.findByIdProduit(param.id);
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

  @Get('/recherche/searchProduit')
  public async esSearch(@Body('keywords') keywords: string, @Body('id_user') id_user: number){
    let userSearch = {};
    let historicSearch= {};

    userSearch["keywords"] = keywords;
    historicSearch["keywords"] = keywords;
    historicSearch["user"] = id_user;
    historicSearch["userSearch"] = userSearch;    
      
    const results = await this.historicSeachService.addUserSearch(id_user, historicSearch).then(()=>{
      return this.produitsService.searchProduit(keywords);
    });
    return results;
  }

  @Get('/recherche/searchTitre')
  public async esSearchTitre(@Body('titre') titre: string){
    const results = await this.produitsService.searchTitre(titre);
    return results;
  }

  @Get('/GeneratePdf/generatePDF')
  public async generatePDF(@Body() body, @Res() res) {
    
    const pdfDoc = printer.createPdfKitDocument(docDefinitionFacture);
    let chunks = [];
    pdfDoc.on('data', (chunk) => {chunks.push(chunk);});
    pdfDoc.on('end', () =>{
      let pdfData = Buffer.concat(chunks);
      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-disposition': 'attachment;filename=eco.pdf'
      });
      res.end(pdfData);
    });
    pdfDoc.end();
  }

  @Post()
  //@UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('user', 'admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({})
  async create(@Body() addProduitsDto: ProduitsDto) {  
    let data = {};
    let detail_fabrication = {};
    let detail_physique = {};
    let prix = {};
    let historique = [];
    let creer = {};
    let date = new Date().toISOString().slice(0, 10);
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
    creer["date_creation"] = date;
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
    
    return this.produitsService.createProduit(data);
  }

  @Put('/:id')
  //@UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('user', 'admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({})
    public async updateProduits(@Param() param, @Body() body, @Body() vraiBody){ 
      const produit = await this.produitsService.findByIdProduit(param.id);
    
      let champs = {};
      let modifier = {};
      let modificationArray = [];
      let date_modification = new Date().toISOString().slice(0, 10);
      
      let key = Object.keys(vraiBody);
      for(let i = 0; i < key.length; i++){
        let OldValue = produit[key[i]];
        champs[key[i]+"Old"] = (produit[key[i]] === undefined && (key[i] == "numero_model" || key[i] == "date_sortie"))  ? produit.detail_fabrication[key[i]] : (produit[key[i]] === undefined && (key[i] == "poids" || key[i] == "longueur" || key[i] == "largeur" || key[i] == "couleur" || key[i] == "taille")) ? produit.detail_physique[key[i]] : (produit[key[i]] === undefined && (key[i] == "prix_normal" || key[i] == "prix_promotion"))  ? produit.prix[key[i]] : produit[key[i]];
        champs[key[i]+"New"] = vraiBody[key[i]];
      }

      modifier["modificateur"] = vraiBody.modificateur;
      modifier["date_modification"] = date_modification;
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
          
        const produits = await this.produitsService.updateProduit(param.id, body).then(()=>{
            return this.produitsService.updateModifier(param.id, modificationArray);
        });
        return produits;
    }

    @Put('/update/lancement/:id')
    //@UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('user', 'admin')
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({})
    public async updateLancement(@Param() param, @Body() body){
      let lancer = {};
      let date_lancement = new Date().toISOString().slice(0, 10);

      lancer["lanceur"] = body.lanceur;
      lancer["date_lancement"] = date_lancement;
      
      const produits = await this.produitsService.updateLancer(param.id, lancer);
      return produits;
    }

    @Put('/update/archive/:id')
    //@UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('user', 'admin')
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({})
    public async updateArchive(@Param() param, @Body() body){
      let archive = {};
      let date_archive = new Date().toISOString().slice(0, 10);

      archive["archiveur"] = body.archiveur;
      archive["date_archive"] = date_archive;
      
      const produits = await this.produitsService.updateArchiver(param.id, archive);
      return produits;
    }

    @Put('/update/imagesAdd/:id')
    //@UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('user', 'admin')
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({})
    public async addImages(@Param() param, @Request() req, @Res() res){
      const response = [];
      let filename;
      let nomImage;
      nomImage = req.body.images.map(file => file.original.filename);
      await new Promise((resolve) => {
        let that = this;
        setTimeout(function(){
          let dimensions = sizeOf('uploads/produits/'+nomImage[0]);
          if(dimensions.width < 200 && dimensions.height < 300){
            let image = nomImage[0].split("-")
            glob(`**uploads/produits/${image[0]}*`, function(err, files) {
                if (err) throw err;
                for (const file of files) {
                    fs.unlink(file);
                }
            });
            res.send("error: width < 180 or height < 240");
          } else {
              filename = req.body.images.map(file => file.original.filename.split("-"));
              for(let i = 0; i < filename.length; i++){
                response.push(filename[i][0]);
              }
            
              const produits = that.produitsService.updateAddImage(param.id, response);
              res.send("Images ajoutés");
              return produits;
          } 
        }, 1000);
      });  
    }

    @Put('/update/imagesRemove/:id')
    //@UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('user', 'admin')
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({})
    public async deleteImages(@Param() param, @Body() body){
      let images = [];
      images = body.images;
      var glob = require("glob");
      const fs = require('fs-extra');
       
      for (var i = 0; i < images.length; i++){
        glob(`**uploads/produits/${body.images[i]}*`, function(err, files) {
            if (err) throw err;
            for (const file of files) {
              fs.unlink(file);
            }
        });
      }
      const produits = await this.produitsService.updateDeleteImage(param.id, images);
      return produits;      
    }

    @Put('/update/favorisAdd/:id')
    //@UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('user', 'admin')
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({})
    public async updateFavorisPush(@Param() param, @Body() body){
      let array = [];
      let values = Object.values(body);
      Array.prototype.push.apply(array, values);
      const produits = await this.produitsService.updateFavorisAdd(param.id, array);
      return produits;
    }

    @Put('/update/favorisRemove/:id')
    //@UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('user', 'admin')
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({})
    public async updateFavorisPull(@Param() param, @Body() body){
      let array = [];
      let values = Object.values(body);
      Array.prototype.push.apply(array, values);
      
      const produits = await this.produitsService.updateFavorisRemove(param.id, array[0]);
      return produits;
    }

    @Put('/update/voteAdd/:id')
    //@UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('user', 'admin')
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({})
    public async updateVotePush(@Param() param, @Body() body){
      let array = [];
      let values = Object.values(body);
      Array.prototype.push.apply(array, values);
      const produits = await this.produitsService.updateVoteAdd(param.id, array);
      return produits;
    }

    @Put('/update/voteRemove/:id')
    //@UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('user', 'admin')
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({})
    public async updateVotePull(@Param() param, @Body() body){
      let array = [];
      let values = Object.values(body);
      Array.prototype.push.apply(array, values);
      const produits = await this.produitsService.updateVoteRemove(param.id, array[0]);
      return produits;
    }

    @Put('/update/incrementView/:id')
    //@UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('user', 'admin')
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({})
    public async incrementView(@Param() param){
      const produits = await this.produitsService.incrementView(param.id);
      return produits;
    }

    @Put('/update/updateMultipleEtat')
    //@UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('user', 'admin')
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({})
    public async updateMultipleEtat(@Body() body){
      let id_produits = [];
      id_produits = body.id_produits;
      let etat = body.etat;
      return this.produitsService.updateMultipleEtat(id_produits, etat);
    }

    @Put('/update/decrementQuantite/:id')
    //@UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('user', 'admin')
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({})
    public async decrementQuantite(@Param() param, @Body() body){
      const produit = await this.produitsService.findByIdProduit(param.id);

      let qteProduit = body.quantite;
      
      if(produit.quantite > qteProduit){
        qteProduit = -Math.abs(qteProduit);
      
        const produits = await this.produitsService.decrementQuantite(param.id, qteProduit);
        return produits;
      } else return "Stock epuisé";
    }

    @Delete('/:id')
    //@UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('user', 'admin')
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({})
    public async deleteProduits(@Param() param) {
        const produit = await this.produitsService.findByIdProduit(param.id);
        let images = produit['images'];
        var j = images.length;
        const fs = require('fs-extra');
        var glob = require("glob");
       
        for (var i = 0; i < j; i++){
          glob(`**uploads/produits/${images[i]}*`, function(err, files) {
              if (err) throw err;
              for (const file of files) {
                fs.unlink(path.join(file));
              }
          });
        }
        return this.produitsService.deleteProduit(param.id);
    }

    @Delete('/delete/deleteMultipleProduits')
    //@UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('user', 'admin')
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({})
    public async deleteManyProduits(@Body() body){
      let id_produits = [];
      id_produits = body.id_produits;
      let j = id_produits.length;
      var glob = require("glob");

      for(var i = 0; i < j; i++){        
        let produit = await this.produitsService.findByIdProduit(id_produits[i]);
        let images = produit['images'];
        let image_nombres = images.length;
        const fs = require('fs-extra');
        for(let a = 0; a < image_nombres; a++){
          glob(`**uploads/produits/${images[a]}*`, function(err, files) {
            if (err) throw err;
            for (const file of files) {
              fs.unlink(path.join(file));
            }
          });
        }        
      }
      return this.produitsService.deleteMultipleProduits(id_produits);
    }
}
