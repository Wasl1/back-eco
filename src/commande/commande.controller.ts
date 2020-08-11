import { Controller, Get, Post, Body, Param, Patch, Delete, Put } from '@nestjs/common';
import { CommandesService } from './commande.service';
import { CreateDTO } from './dto/create.dto';


@Controller('commande')
export class CommandeController {

constructor(private readonly service:CommandesService){}

  @Get('all')
  async GetAll(){
    return await this.service.getAll();
  }


  @Get('/:id')
  async getCommande(@Param() CommandeID){
      const commande = await this.service.getCommande(CommandeID.id);
      return commande;
  }

  @Get('get_iduser_commande/:id_commandes')
  public async get_iduser_commande(@Param() param){
  const commande = await this.service.get_iduser_commande(param.id_commandes);
  let user = commande.id_user;
  return {user, total : user.length};
  }

  
  @Get('get_idproduit_commande/:id_commandes')
  public async get_idproduit_commande(@Param() param){
  const commande = await this.service.get_idproduit_commande(param.id_commandes);
  let user = commande.id_produit;
  return {user, total : user.length};
  }

  @Post()
  async createCommande(@Body() createDTO: CreateDTO) {
      const commande = await this.service.createCommande(createDTO);
      return commande;
  }


  @Put('/:id')
  public async updateCommande(@Param() param, @Body() body) {
      const commande = await this.service.updateCommande(param.id, body);
      return commande;
  }


  @Delete('/:id')
    public async deleteCommande(@Param() param) {
        const commande = await this.service.deleteCommande(param.id);
        return commande;
    }
  }

