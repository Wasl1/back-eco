import { Controller,Post,Body,Get,Param,Delete,HttpStatus, Put } from '@nestjs/common';

import { categorieService } from './categorie.service';
import { categorieDto } from './dto/categorie.dto'


@Controller('categorie')
export class categorieController {
    constructor(private readonly categorieService: categorieService) {}

    @Post()
    async addcategorie(@Body() CreatePostDTO: categorieDto) {
        const categorie = await this.categorieService.insertcategorie(CreatePostDTO);
        return categorie;
    }

    @Get()
    async getAllcategorie() {
        const categorie = await this.categorieService.getcategorie();
        return categorie;
    }

    @Get(':id')
    async getcategorie(@Param('id') categorieId: string) {
         const categorie = await this.categorieService.getSinglecategorie(categorieId);
         return categorie;
    }

    @Put(':id')
    async updatecategorie(@Param('id') categorieId: string, @Body() CreatePostDTO: categorieDto) {
        const categorie = await this.categorieService.updatecategorie(categorieId,CreatePostDTO);
        return categorie;
    };
        
    @Delete(':id')
    async removecategorie(@Param('id') categorieId: string) {
        const isDeleted = await this.categorieService.deletecategorie(categorieId);
        return isDeleted;
    };
}
