import { Controller, Post, Body, Get, Param, Delete, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { HistoricSearchService } from './historic-search.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';

@Controller('historic-search')
export class HistoricSearchController {
    constructor(private historicSeachService: HistoricSearchService) {}

    @Get()
    //@UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({})
    public async getAllHistorique() {
        const historique = await this.historicSeachService.findAll();
        return { historique, total: historique.length };
    }

    @Get('find')
    //@UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({})
    public async findHistorique(@Body() body) {
        const queryCondition = body;
        const historique = await this.historicSeachService.find(queryCondition);
        return historique;
    }

    @Get('/recherche/esSearchHistorique')
    //@UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({})
    public async esSearchHistorique(@Body('query') query: string){   
        const results = await this.historicSeachService.EsSearchHistorique(query);
        return results;
    }

    @Delete('/:id')
    //@UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({})
    public async deleteHistorique(@Param() param) {
        return this.historicSeachService.delete(param.id);
    }
}
