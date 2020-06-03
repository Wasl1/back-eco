import { Controller, Post, Body } from '@nestjs/common';
import { HistoricSearchService } from './historic-search.service';
import { historicSearchDto } from './dto/historicSearch.dto';

@Controller('historic-search')
export class HistoricSearchController {
    constructor(private historicSeachService: HistoricSearchService) {}

    @Post() 
    async create(@Body() body: historicSearchDto) {
        return await this.historicSeachService.create(body);
    }
}
