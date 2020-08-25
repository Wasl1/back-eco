import { Controller, Get, Post, Body, Param, Patch, Delete, Put } from '@nestjs/common';
import { CommandesService } from './commande.service';
import { CommandeDTO } from './dto/commandes.dto';
import { commandesSchema } from './schemas/commandes.schema';


@Controller('commande')
export class CommandeController {

constructor(private readonly service:CommandesService){}

  @Get()
  async GetAll(){
    return await this.service.getAll();
  }


  @Get('/:CommandeID')
  public async getCommande(@Param() param){
    return await this.service.getCommande(param.CommandeID);
      
  }


  @Post()
  async createCommande(@Body() createDTO: CommandeDTO) {
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