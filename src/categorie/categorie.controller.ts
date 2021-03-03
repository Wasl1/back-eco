import { Controller,Post,Body,Get,Param,Delete,HttpStatus, Put, UseGuards, HttpCode, Res } from '@nestjs/common';
import { categorieService } from './categorie.service';
import { categorieDto } from './dto/categorie.dto';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';


@Controller('categorie')
export class categorieController {
    constructor(private readonly categorieService: categorieService) {}

    @Post()
    async addcategorie(@Body() CreatePostDTO: categorieDto) {        
        if (CreatePostDTO.nom == undefined|| CreatePostDTO.description == undefined) {
            return {
                code: 4002,
                message: "données manquantes",
                value: []
              }
        } else {
            const categorie = await this.categorieService.insertcategorie(CreatePostDTO);
            return {
                code: 4000,
                message: "categorie ajoutée avec succes",
                value: [categorie]
              }
        }
    }

    @Get()
    async getAllcategorie() {
        const categorie = await this.categorieService.getcategorie();
        return {
            code: 4000,
            message: "liste des categories",
            value: [categorie]
        }
    }

    @Get(':id')
    async getcategorie(@Param('id') categorieId: string) {
         const categorie = await this.categorieService.getSinglecategorie(categorieId);
         return {
            code: 4000,
            message: "categorie trouvé avec succes",
            value: [categorie]
          }
    }

    @Put(':id')
    async updatecategorie(@Param('id') categorieId: string, @Body() CreatePostDTO: categorieDto) {
        const categorie = await this.categorieService.updatecategorie(categorieId,CreatePostDTO);
        return {
            code: 4000,
            message: "categorie modifié avec succes",
            value: [categorie]
          }
    };
        
    @Delete(':id')
    async removecategorie(@Param('id') categorieId: string, @Res() res) {
        const isDeleted = await this.categorieService.deletecategorie(categorieId);
        res.send({
            code: 4000,
            message: "categorie suprrimé avec succes",
            value: []
          });
        return isDeleted;
    };
}
