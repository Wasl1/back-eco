import { Controller, Get, Post, Body, Res, HttpStatus, Response, Param, Patch, Delete } from '@nestjs/common';
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
  async getPost(@Param() postID){
      const post = await this.service.getPost(postID.id)
      return post;
  }


  @Post()
  async addPost(@Res() res, @Body() createDTO: CreateDTO) {
      const newPost = await this.service.createCommande(createDTO);
      return newPost;
      }


  @Patch('/:id')
  public async updateTodo(@Res() res,@Param() param, @Body() body) {
      const todo = await this.service.editPost(param.id, body);
      return todo;
  }


  @Delete('/:id')
    public async deleteTodo(@Param() param, @Response() res) {
        const todo = await this.service.delete(param.id);
        return todo;
    }
  }

