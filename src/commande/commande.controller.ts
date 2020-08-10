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

  @Get('getid_commande/:id_commandes')
  public async getid_commande(@Param() param){
  const commande = await this.service.getid_commande(param.id_commandes);
  let user = commande.id_produit;
  return user;
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

