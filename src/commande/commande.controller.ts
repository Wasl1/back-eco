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
      const post = await this.service.getCommande(CommandeID.id)
      return post;
  }


  @Post()
  async addCommande(@Body() createDTO: CreateDTO) {
      const newPost = await this.service.createCommande(createDTO);
      return newPost
  }


  @Put('/:id')
  public async updateCommande(@Param() param, @Body() body) {
      const commande = await this.service.editPost(param.id, body);
      return commande;
  }


  @Delete('/:id')
    public async deleteCommande(@Param() param) {
        const commande = await this.service.delete(param.id);
        return commande;
    }
  }

