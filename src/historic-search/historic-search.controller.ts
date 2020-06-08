import { Controller, Post, Body, Get, Put, Param, Delete, Query } from '@nestjs/common';
import { HistoricSearchService } from './historic-search.service';
import { historicSearchDto } from './dto/historicSearch.dto';

@Controller('historic-search')
export class HistoricSearchController {
    constructor(private historicSeachService: HistoricSearchService) {}

    @Get()
    public async getAllHistoric() {
        const historic = await this.historicSeachService.findAll();
        return { historic, total: historic.length };
    }

    @Get('find')
    public async findHistorique(@Body() body) {
        const queryCondition = body;
        const historic = await this.historicSeachService.find(queryCondition);
        return historic;
    }

    @Get('/recherche/esSearchHistorique')
    public async esSearchHistorique(@Query('query') query: string){   
        const results = await this.historicSeachService.EsSearchHistorique(query);
        return results;
    }

    @Post() 
    async create(@Body() body: historicSearchDto) {
        let userSearch = {};
        userSearch["keywords"] = body.keywords;
        body["userSearch"] = userSearch;
        return await this.historicSeachService.create(body);
    }

    @Put('/update/addUserSearch')
    public async updateArchive(@Body() body){
      let userSearch = {};

      userSearch["keywords"] = body.keywords;
      body["userSearch"] = userSearch;
      console.log("body",body);
      
      
      const search = await this.historicSeachService.addUserSearch(body.user, body);
      return search;
    }

    @Delete('/:id')
    public async deleteProduits(@Param() param) {
        return this.historicSeachService.delete(param.id);
    }
}
