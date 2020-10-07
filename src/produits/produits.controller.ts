import { Controller, Post, Body, Get, Param, Put, Delete, Res, HttpStatus, ParseIntPipe, UseInterceptors, UploadedFiles, UseGuards, HttpCode, UseFilters } from "@nestjs/common";
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
import { diskStorage } from 'multer';
import { FilesInterceptor } from "@nestjs/platform-express";
import { editFileName, resizeImagesProduits } from 'src/ImageConverter/file.util';
import { HttpExceptionFilter  } from 'src/exception/unauthorizedExceptionFilter';
let path = require('path');
let sizeOf = require("image-size");
const fs = require('fs-extra');
let glob = require("glob");

@Controller("produits")
export class ProduitsController {
  constructor(private produitsService: ProduitsService, 
    private historicSeachService: HistoricSearchService,
    @InjectModel('Produits') private produitsModel: Model<ProduitsInterface> ) {}

@Get()
public async getAllProduits() {
  const produits = await this.produitsService.findAllProduits();
  return { 
    code: 4000,
    message: "liste des produits",
    value: [
      produits
    ]
  };
}

@Get('getLastProduits')
public async getLastProduits() {
  const produits = await this.produitsService.getLastProduits();
  return { 
    code: 4000,
    message: "liste des produits",
    value: [
      produits
    ]
  };
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
    res.send({produits: result.docs, TotalProduits: result.totalDocs, TotalPages: result.totalPages});
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
  return { 
    code: 4000,
    message: "produit trouvé avec succes",
    value: [
      produits
    ]
  };
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
    return { 
      code: 4000,
      message: "resultat trouvé",
      value: results
    };
  }

  @Get('/recherche/searchTitre')
  public async esSearchTitre(@Body('titre') titre: string){
    const results = await this.produitsService.searchTitre(titre);
    return { 
      code: 4000,
      message: "resultat trouvé",
      value: results
    };
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
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @UseFilters(new HttpExceptionFilter())
  @Roles('user', 'admin')
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
    creer["acteur"] = addProduitsDto.acteur;
    creer["date"] = date;
    historique.push({"creer": creer});
    data["titre"] = addProduitsDto.titre;
    data["description"] = addProduitsDto.description;
    data["marque"] = addProduitsDto.marque;
    data["categorie"] = addProduitsDto.categorie;
    data["quantite"] = addProduitsDto.quantite;
    data["detail_fabrication"] = detail_fabrication;
    data["detail_physique"] = detail_physique;
    data["prix"] = prix;
    data["garantie"] = addProduitsDto.garantie;
    data["provenance"] = addProduitsDto.provenance;
    data["historique"] = historique;
  
    return addProduitsDto.titre == undefined ? { code: 4002, message: "Veillez renseigner le titre", value: []}
           : addProduitsDto.description == undefined ? { code: 4002, message: "Veillez renseigner la description", value: []}
           : addProduitsDto.categorie == undefined ? { code: 4002, message: "Veillez renseigner la categorie", value: []}
           : addProduitsDto.quantite == undefined ? { code: 4002, message: "Veillez renseigner la quantité", value: []}
           : addProduitsDto.garantie == undefined ? { code: 4002, message: "Veillez renseigner la descripgarantietion", value: []}
           : addProduitsDto.acteur == undefined ? { code: 4002, message: "Veillez renseigner l'acteur", value: []}
           : addProduitsDto.provenance == undefined ? { code: 4002, message: "Veillez renseigner la provenance", value: []}
           : addProduitsDto.numero_model == undefined ? { code: 4002, message: "Veillez renseigner le numero_model", value: []}
           : addProduitsDto.date_sortie == undefined ? { code: 4002, message: "Veillez renseigner la date_sortie", value: []}
           : addProduitsDto.prix_normal == undefined ? { code: 4002, message: "Veillez renseigner le prix_normal", value: []}
           : addProduitsDto.prix_promotion == undefined ? { code: 4002, message: "Veillez renseigner le prix_promotion", value: []}
           : {code: 4000, message: "produit ajouté avec success", value: [await this.produitsService.createProduit(data)]}
  }

  @Post("/duplicate")
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @UseFilters(new HttpExceptionFilter())
  @Roles('user', 'admin')
  public async duplicateProduit(@Body() body){
    if( !body.id_produits ){
     return { 
       code: 4002, message: "Veillez renseigner le produit à copier", 
       value: []
      }
    }
    let id_produits = [];
    id_produits = body.id_produits;
    let j = id_produits.length;
    let produitArray = [];
    for(let i = 0; i < j; i++) {
      const produit = await this.produitsService.findByIdProduit(id_produits[i]);
      let data = {};
      let creer = {};
      let date = new Date().toISOString().slice(0, 10);
      let historique = [];

      creer["acteur"] = body.acteur;
      creer["date"] = date;
      historique.push({"creer": creer});
  
      data["titre"] = produit.titre+'_copy';
      data["description"] = produit.description;
      data["marque"] = produit.marque;
      data["categorie"] = produit.categorie;
      data["quantite"] = produit.quantite;
      data["detail_fabrication"] = produit.detail_fabrication;
      data["detail_physique"] = produit.detail_physique;
      data["prix"] = produit.prix;
      data["garantie"] = produit.garantie;
      data["provenance"] = produit.provenance;
      data["historique"] = historique;

      produitArray.push(data);    
    }

    return body.acteur == undefined ? { code: 4002, message: "Veillez renseigner l'acteur'", value: []}
           : {code: 4000, message: "produits copiés avec succes", value: await this.produitsService.createMultipleProduit(produitArray)}
    
  }

  @Put('/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @UseFilters(new HttpExceptionFilter())
  @Roles('user', 'admin')
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
        return {
          code: 4000,
          message: "produit modifié avec succes",
          value: [produits]
        }
    }

    @Put('/update/lancement/:id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @UseFilters(new HttpExceptionFilter())
    @Roles('user', 'admin')
    public async updateLancement(@Param() param, @Body() body){
      let lancer = {};
      let date = new Date().toISOString().slice(0, 10);

      lancer["acteur"] = body.acteur;
      lancer["date"] = date;

      return body.acteur == undefined ? { code: 4002, message: "Veillez renseigner l'acteur'", value: []}
           : {code: 4000, message: "produit lancé avec succes", value: [await this.produitsService.updateLancer(param.id, lancer)]};
    }

    @Put('/update/multipleLancement')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @UseFilters(new HttpExceptionFilter())
    @Roles('user', 'admin')
    public async updateMultipleLancement(@Body() body){
      if( !body.id_produits ){
        return { 
          code: 4002, message: "Veillez renseigner les produit à lancer", 
          value: []
         }
      }
      let id_produits = [];
      id_produits = body.id_produits;
      let lancer = {};
      let date = new Date().toISOString().slice(0, 10);

      lancer["acteur"] = body.acteur;
      lancer["date"] = date;
      
      return body.acteur == undefined ? { code: 4002, message: "Veillez renseigner l'acteur'", value: []}
           : {code: 4000, message: "produits lancés avec succes", value: [await this.produitsService.updateMultipleLancer(id_produits, lancer)]}
    }

    @Put('/update/archive/:id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @UseFilters(new HttpExceptionFilter())
    @Roles('user', 'admin')
    public async updateArchive(@Param() param, @Body() body){
      let archive = {};
      let date = new Date().toISOString().slice(0, 10);

      archive["acteur"] = body.acteur;
      archive["date"] = date;
  
      return body.acteur == undefined ? { code: 4002, message: "Veillez renseigner l'acteur'", value: []}
      : {code: 4000, message: "produit archivé avec succes", value: [await this.produitsService.updateArchiver(param.id, archive)]};
    }

    @Put('/update/multipleArchive')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @UseFilters(new HttpExceptionFilter())
    @Roles('user', 'admin')
    public async updateMultipleArchive(@Body() body){
      if( !body.id_produits ) {
        return { 
          code: 4002, message: "Veillez renseigner les produit à archiver", 
          value: []
         }
      }
      let id_produits = [];
      id_produits = body.id_produits;
      let archive = {};
      let date = new Date().toISOString().slice(0, 10);

      archive["acteur"] = body.acteur;
      archive["date"] = date;
      
      return body.acteur == undefined ? { code: 4002, message: "Veillez renseigner l'acteur'", value: []}
           : {code: 4000, message: "produits archivés avec succes", value: [await this.produitsService.updateMultipleArchiver(id_produits, archive)]}
    }

    @Put('/update/imagesAdd/:id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @UseFilters(new HttpExceptionFilter())
    @Roles('user', 'admin')
    @UseInterceptors(
      FilesInterceptor('images', 3, {
        storage: diskStorage({
          destination: (req: Request, file, cb) =>
            cb(null, 'uploads/produits'),
          filename: editFileName,
        }),
      }),
    )
    public async addImages(@UploadedFiles() files, @Param() param){
      const response = [];
      let images = [];
      files.forEach(file => {
          const [, ext] = file.mimetype.split('/');
          let dimensions = sizeOf('uploads/produits/'+file.filename);
          if(dimensions.width < 180 && dimensions.height < 240){
              glob(`**uploads/produits/${file.filename}*`, function(err, files) {
                  if (err) throw err;
                  for (const file of files) {
                      fs.unlink(file);
                  }
              });        
          } else{
            resizeImagesProduits(ext, file);
            const fileResponse = {
                file: file
            };
            response.push(fileResponse);
            fs.unlink('uploads/produits/'+file.filename);          
          }
      });
      let filename = response.map(file => file.file.filename);
      filename.forEach(imageName => {        
        images.push(imageName.split(".")[0]);
      });            

      if(response.length < files.length && response.length > 0){
        let originalname = response.map(file => file.file.originalname);
        let imageBloquees = files.length - response.length;
        
        const produits = await this.produitsService.updateAddImage(param.id, images);
        return {
          code: '4004',
          message: 'width inférieur à 180 and height inférieur à 240',
          value: [{
            nbImageAjoutees: response.length,
            nbImageBloquees: imageBloquees,
            imageAjoutees: originalname,
            nomBase: filename,
            produit: produits
          }]
        };
      } else if(response.length < files.length && response.length == 0){
        let imageBloquees = files.length - response.length;
          return {
            code: '4004',
            message: 'width inférieur à 180 and height inférieur à 240',
            value:[{
              imageBloquees: imageBloquees
            }]
          };
      } else{
        const produits = await this.produitsService.updateAddImage(param.id, images);
        return {
          code: '4000',
            message: 'images ajoutées avec success',
            value: [
              produits
            ]
        };
      }
    }

    @Put('/update/imagesRemove/:id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @UseFilters(new HttpExceptionFilter())
    @Roles('user', 'admin')
    public async deleteImages(@Param() param, @Body() body){
      let images = body.images;
      for (var i = 0; i < images.length; i++){
        let imagesBd = images[i].split(".");        
        glob(`**uploads/produits/${imagesBd[0]}*`, function(err, files) {
            if (err) throw err;
            for (const file of files) {
              fs.unlink(file);
            }
        });
      }
      const produits = await this.produitsService.updateDeleteImage(param.id, images);  
      return {
        code: 4000,
        message: "images supprimés avec succes",
        value: [produits]
      }
    }

    @Put('/update/favorisAdd/:id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @UseFilters(new HttpExceptionFilter())
    @Roles('user', 'admin')
    public async updateFavorisPush(@Param() param, @Body() body){
      if( !body.acteur ) {
        return { 
          code: 4002, message: "Veillez renseigner l'acteur", 
          value: []
         }
      }
      let array = [];
      let values = Object.values(body);
      Array.prototype.push.apply(array, values);
      const produits = await this.produitsService.updateFavorisAdd(param.id, array);
      return {
        code: 4000,
        message: "favoris ajouté avec succes",
        value: [produits]
      }
    }

    @Put('/update/favorisRemove/:id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @UseFilters(new HttpExceptionFilter())
    @Roles('user', 'admin')
    public async updateFavorisPull(@Param() param, @Body() body){
      if( !body.acteur ) {
        return { 
          code: 4002, message: "Veillez renseigner l'acteur", 
          value: []
         }
      }
      let array = [];
      let values = Object.values(body);
      Array.prototype.push.apply(array, values);
      
      const produits = await this.produitsService.updateFavorisRemove(param.id, array[0]);
      return {
        code: 4000,
        message: "favoris supprimé avec succes",
        value: [produits]
      }
    }

    @Put('/update/voteAdd/:id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @UseFilters(new HttpExceptionFilter())
    @Roles('user', 'admin')
    public async updateVotePush(@Param() param, @Body() body){
      if( !body.acteur ) {
        return { 
          code: 4002, message: "Veillez renseigner l'acteur", 
          value: []
         }
      }
      let array = [];
      let values = Object.values(body);
      Array.prototype.push.apply(array, values);
      const produits = await this.produitsService.updateVoteAdd(param.id, array);
      return {
        code: 4000,
        message: "vote ajouté avec succes",
        value: [produits]
      }
    }

    @Put('/update/voteRemove/:id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @UseFilters(new HttpExceptionFilter())
    @Roles('user', 'admin')
    public async updateVotePull(@Param() param, @Body() body){
      if( !body.acteur ) {
        return { 
          code: 4002, message: "Veillez renseigner l'acteur", 
          value: []
         }
      }
      let array = [];
      let values = Object.values(body);
      Array.prototype.push.apply(array, values);
      const produits = await this.produitsService.updateVoteRemove(param.id, array[0]);
      return {
        code: 4000,
        message: "vote supprimé avec succes",
        value: [produits]
      }
    }

    @Put('/update/incrementView/:id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @UseFilters(new HttpExceptionFilter())
    @Roles('user', 'admin')
    public async incrementView(@Param() param){
      const produits = await this.produitsService.incrementView(param.id);
      return {
        code: 4000,
        message: "vu incrementé avec succes",
        value: [produits]
      }
    }

    @Put('/update/updateMultipleEtat')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @UseFilters(new HttpExceptionFilter())
    @Roles('user', 'admin')
    public async updateMultipleEtat(@Body() body){
      let id_produits = [];
      id_produits = body.id_produits;
      let etat = body.etat;
      const produits = await this.produitsService.updateMultipleEtat(id_produits, etat);
      return {
        code: 4000,
        message: "etat modifiés avec succes",
        value: [produits]
      }
    }

    @Put('/update/decrementQuantite/:id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @UseFilters(new HttpExceptionFilter())
    @Roles('user', 'admin')
    public async decrementQuantite(@Param() param, @Body() body){
      const produit = await this.produitsService.findByIdProduit(param.id);

      let qteProduit = body.quantite;
      
      if(produit.quantite > qteProduit){
        qteProduit = -Math.abs(qteProduit);
      
        const produits = await this.produitsService.decrementQuantite(param.id, qteProduit);
        return {
          code: 4000,
          message: "quantité decrementé avec succes",
          value: [produits]
        }
      } else 
          return {
            code: 4000,
            message: "Stock epuisé",
            value: []
          }
    }

    @Delete('/:id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @UseFilters(new HttpExceptionFilter())
    @Roles('user', 'admin')
    public async deleteProduits(@Param() param, @Res() res) {
        const produit = await this.produitsService.findByIdProduit(param.id);
        let images = produit['images'];        
        let j = images.length;
       
        for (let i = 0; i < j; i++){
          let imagesDb = images[i];
          
          glob(`**uploads/produits/${imagesDb}*`, function(err, files) {
              if (err) throw err;
              for (const file of files) {
                fs.unlink(path.join(file));
              }
          });
        }
        res.send({
          code: 4000,
          message: "produit supprimé avec succes",
          value: []
        });
        return this.produitsService.deleteProduit(param.id);
    }

    @Delete('/delete/deleteMultipleProduits')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @UseFilters(new HttpExceptionFilter())
    @Roles('user', 'admin')
    public async deleteManyProduits(@Body() body, @Res() res){
      if( !body.id_produits ) {
        return { 
          code: 4002, message: "Veillez renseigner les produits à supprimer", 
          value: []
         }
      }
      let id_produits = [];
      id_produits = body.id_produits;
      let j = id_produits.length;

      for(var i = 0; i < j; i++){        
        let produit = await this.produitsService.findByIdProduit(id_produits[i]);
        let images = produit['images'];
        let image_nombres = images.length;
        for(let a = 0; a < image_nombres; a++){
          let imagesDb = images[a];          
          glob(`**uploads/produits/${imagesDb}*`, function(err, files) {
            if (err) throw err;
            for (const file of files) {
              fs.unlink(path.join(file));
            }
          });
        }        
      }
      res.send({
        code: 4000,
        message: "produits supprimés avec succes",
        value: []
      });
      return this.produitsService.deleteMultipleProduits(id_produits);
    }
}
