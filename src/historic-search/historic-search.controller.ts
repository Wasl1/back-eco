import { Controller, Post, Body, Get, Param, Delete, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { HistoricSearchService } from './historic-search.service';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';

@Controller('historic-search')
export class HistoricSearchController {
    constructor(private historicSeachService: HistoricSearchService) {}

    @Get()
    public async getAllHistorique() {
        const historique = await this.historicSeachService.findAll();
        return { historique, total: historique.length };
    }

    @Get('find')
    public async findHistorique(@Body() body) {
        const queryCondition = body;
        const historique = await this.historicSeachService.find(queryCondition);
        return historique;
    }

    @Get('/recherche/esSearchHistorique')
    public async esSearchHistorique(@Body('query') query: string){   
        const results = await this.historicSeachService.EsSearchHistorique(query);
        return results;
    }

    @Delete('/:id')
    public async deleteHistorique(@Param() param) {
        return this.historicSeachService.delete(param.id);
    }
}
