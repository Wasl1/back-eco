import { Controller,Post,Body,Get,Param,Delete,HttpStatus, Put } from '@nestjs/common';

import { categorieService } from './categorie.service';
import { CreatePostDTO } from './dto/categorie-post.dto'


@Controller('categorie')
export class categorieController {
    constructor(private readonly categorieService: categorieService) {}

    @Post()
    async addcategorie(@Body() CreatePostDTO: CreatePostDTO) {
        const categorie = await this.categorieService.insertcategorie(CreatePostDTO);
        return {
            statusCode: HttpStatus.OK,
            message: 'categorie added successfully',
            data: categorie,
        };
    }

    @Get()
    async getAllcategorie() {
        const categorie = await this.categorieService.getcategorie();
        return categorie;
    }

    @Get(':id')
    getcategorie(@Param('id') categorieId: string) {
        return this.categorieService.getSinglecategorie(categorieId);
    }

    @Put(':id')
    async updatecategorie(@Param('id') categorieId: string, @Body() CreatePostDTO: CreatePostDTO) {
        const categorie = await this.categorieService.updatecategorie(categorieId,CreatePostDTO);

        if (categorie){
        return {
            statusCode: HttpStatus.OK,
            message: 'categorie updated successfully',
            categorie: categorie,
        }
        };
        };
        
    @Delete(':id')
    async removecategorie(@Param('id') categorieId: string) {
        const isDeleted = await this.categorieService.deletecategorie(categorieId);
        
        if (isDeleted) {
            return {
                statusCode: HttpStatus.OK,
                message: 'categorie deleted successfully',
            }
    };
    };
}
