import { Controller,Post,Body,Get,Param,Delete,HttpStatus, Put, UseGuards, HttpCode } from '@nestjs/common';
import { categorieService } from './categorie.service';
import { categorieDto } from './dto/categorie.dto'
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';


@Controller('categorie')
export class categorieController {
    constructor(private readonly categorieService: categorieService) {}

    @Post()
    //@UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({})
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
    //@UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({})
    async updatecategorie(@Param('id') categorieId: string, @Body() CreatePostDTO: categorieDto) {
        const categorie = await this.categorieService.updatecategorie(categorieId,CreatePostDTO);
        return categorie;
    };
        
    @Delete(':id')
    //@UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({})
    async removecategorie(@Param('id') categorieId: string) {
        const isDeleted = await this.categorieService.deletecategorie(categorieId);
        return isDeleted;
    };
}
