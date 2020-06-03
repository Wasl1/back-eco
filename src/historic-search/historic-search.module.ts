import { Module } from '@nestjs/common';
import { HistoricSearchService } from './historic-search.service';
import { HistoricSearchController } from './historic-search.controller';
import { historicSearchSchema } from './schema/historicSearch.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forFeature([{name: 'historicSearch', schema: historicSearchSchema}])],
  providers: [HistoricSearchService],
  controllers: [HistoricSearchController]
})
export class HistoricSearchModule {}
