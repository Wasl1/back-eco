import { Controller, Get, Post, Body, Param, Patch,Req,Res, Delete, Put, ParseIntPipe } from '@nestjs/common';
import { CommandesService } from './commande.service';
import { CommandeDTO } from './dto/commandes.dto';
import {commandesInterfaces} from './interfaces/commandes.interfaces'
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Controller('commande')
export class CommandeController {

constructor(private readonly service:CommandesService,
  @InjectModel('commande') private commandeModel: Model<commandesInterfaces> ){}

  @Get()
  async GetAll(){
    const commandes = await this.service.getAll();
    return {
      code: 4000,
      message: "liste des commmandes",
      value: [commandes]
  }
  }


  @Get('getFirstCommade')
  async GetFirstCommade(){
    const commande = await this.service.getFirstCommande();
    return {
      code: 4000,
      message: "les prémières commandes",
      value: [commande]
    }
  }

  
  @Get('getLastCommande')
  async GetLastCommande(){
    const commande = await this.service.getLastCommande();
    return {
      code: 4000,
      message: "les dérnières commandes",
      value: [commande]
    }
  }

  @Get('/:CommandeID')
  public async getCommande(@Param() param){
    const commande = await this.service.getCommande(param.CommandeID);   
    return {
      code: 4000,
      message: "commande trouvée",
      value: [commande]
    }
  }

  @Get('getCommandesCustomised/:page')
  public async getCommandesCustomised(@Param('page', new ParseIntPipe()) page: number, @Res() res){
  let options = {
      page: page, 
      limit: 20, 
      sort: {_id: -1},
      populate: ['id_user','commandes.id_produit'],
  }
  let produits = {
    populate: 'commandes.id_produit',
}
  return await this.commandeModel.paginate({}, options, (err, result) => {
    res.send({commandes: result.docs, TotalCommandes: result.totalDocs, TotalPages: result.totalPages});
  });
  }

  @Get('/recherche/searchCommandes')

    public async esSearchCommandes(@Body('search_commandes') search_commandes: string){   
        const results = await this.service.search_commandes(search_commandes);
        return results;
    }

  @Post()
  async createCommande(@Body() createDTO: CommandeDTO) {

    let data = {};
    let tracage = {};
    let payment= {};
    let commandes = {};

    tracage["email"] = createDTO.email;
    tracage["tel"] = createDTO.tel;
    tracage["estimation_delivrance"] = createDTO.estimation_delivrance;

    payment["methode"] = createDTO.methode;
    payment["transaction_id"] = createDTO.transaction_id;
    payment["amount"] = createDTO.amount;
    payment["codepromo"] = createDTO.codepromo;

    commandes["id_produit"] = createDTO.id_produit;
    commandes["title"] = createDTO.title;
    commandes["quantite"] = createDTO.quantite;
    commandes["prix_unitaire"] = createDTO.prix_unitaire;
    commandes["curency"] = createDTO.curency;

    data["id_user"] = createDTO.id_user;
    data["client"] = createDTO.client;
    data["adresse"] = createDTO.adresse;
    data["note_delivrance"] = createDTO.note_delivrance;
    data["etat"] = createDTO.etat;
    data["tracage"] = tracage;
    data["payment"] = payment;
    data["commandes"] = commandes;

    if (createDTO.id_user == undefined || createDTO.client == undefined || createDTO.adresse == undefined || createDTO.note_delivrance == undefined
      || createDTO.etat == undefined || createDTO.email == undefined || createDTO.tel == undefined || createDTO.estimation_delivrance == undefined
      || createDTO.methode == undefined || createDTO.transaction_id == undefined || createDTO.amount == undefined || createDTO.codepromo == undefined
      || createDTO.id_produit == undefined) {
      return {
          code: 4002,
          message: "données manquantes",
          value: []
        }
    } else {
      const commande = await this.service.createCommande(data);;
      return {
          code: 4000,
          message: "commande ajoutée avec succes",
          value: [commande]
        }
    }
  }

  @Put('/:id')
  public async updateCommande(@Param() param, @Body() body) {
      const commande = await this.service.updateCommande(param.id, body);
      return {
        code: 4000,
        message: "commande modifiée avec succes",
        value: [commande]
      }
  }


  @Put('/update/produitAdd/:id')
    public async updateProduitPush(@Param() param, @Body() body){
      let array = [];
      let values = Object.values(body);
      Array.prototype.push.apply(array, values);
      const produit = await this.service.updateProduitAddCommande(param.id, array);
      return {
        code: 4000,
        message: "prduit ajouté avec succes",
        value: [produit]
      }
    }

  @Put('/update/produitRemove/:id')
    public async updateProduitPull(@Param() param, @Body() body){
      let array = [];
      let values = Object.values(body);
      Array.prototype.push.apply(array, values);
      const produit = await this.service.updateProduitRemoveCommande(param.id, array[0]);
      return {
        code: 4000,
        message: "prduit supprimé avec succes",
        value: [produit]
      }
    }


  @Delete('/:id')
    public async deleteCommande(@Param() param, @Res() res) {
        const commande = await this.service.deleteCommande(param.id);
        res.send({
          code: 4000,
          message: "commande supprimée avec succes",
          value: []
        });
        return commande;
    }
  }