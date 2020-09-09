import { Controller, Get, Post, Body, Param, Patch,Req,Res, Delete, Put, ParseIntPipe } from '@nestjs/common';
import { CommandesService } from './commande.service';
import { CommandeDTO } from './dto/commandes.dto';
import { commandesSchema } from './schemas/commandes.schema';
import {commandesInterfaces} from './interfaces/commandes.interfaces'
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Controller('commande')
export class CommandeController {

constructor(private readonly service:CommandesService,
  @InjectModel('commande') private commandeModel: Model<commandesInterfaces> ){}

  @Get()
  async GetAll(){
    return await this.service.getAll();
  }


  @Get('getFirstCommade')
  async GetFirstCommade(){
    return await this.service.getFirstCommande();
  }

  
  @Get('getLastCommande')
  async GetLastCommande(){
    return await this.service.getLastCommande();
  }

  @Get('/:CommandeID')
  public async getCommande(@Param() param){
    return await this.service.getCommande(param.CommandeID);   
  }

  //-- /:page
 
  /*@Get('getCommandesCustomised/:page')
  public async getCommandeCustomised(@Param('page', new ParseIntPipe()) page: number) {
  page = page - 1;
  const commande = await this.service.getCommandeCustomised(page);
  return commande;
  }*/

  @Get('getCommandesCustomised/:page')
  public async getCommandesCustomised(@Param('page', new ParseIntPipe()) page: number, @Res() res){
  let options = {
      page: page, 
      limit: 20, 
      sort: {_id: -1},
      populate: 'id_user',
  }
  let produits = {
    populate: 'commandes.id_produit',
}
  return await this.commandeModel.paginate({}, options, (err, result) => {
    res.send({commandes: result.docs, TotalCommandes: result.totalDocs, TotalPages: result.totalPages});
  });
  }

  @Post()
  async createCommande(@Body() createDTO: CommandeDTO,@Res() res) {
      //const commande = await this.service.createCommande(createDTO);
      //return commande;

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


commandes["id_produit"] = createDTO.id_user;
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

res.send(data);
return this.service.createCommande(data);

  }


  @Put('/:id')
  public async updateCommande(@Param() param, @Body() body) {
      const commande = await this.service.updateCommande(param.id, body);
      return commande;
  }


  @Put('/update/produitAdd/:id')
    public async updateProduitPush(@Param() param, @Body() body){
      let array = [];
      let values = Object.values(body);
      Array.prototype.push.apply(array, values);
      const produit = await this.service.updateProduitAddCommande(param.id, array);
      return produit;
    }

  @Put('/update/produitRemove/:id')
    public async updateProduitPull(@Param() param, @Body() body){
      let array = [];
      let values = Object.values(body);
      Array.prototype.push.apply(array, values);
      const produits = await this.service.updateProduitRemoveCommande(param.id, array[0]);
      return produits;
    }


  @Delete('/:id')
    public async deleteCommande(@Param() param) {
        const commande = await this.service.deleteCommande(param.id);
        return commande;
    }
  }