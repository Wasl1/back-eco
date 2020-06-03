import { Test, TestingModule } from '@nestjs/testing';
import { HistoricSearchService } from './historic-search.service';

describe('HistoricSearchService', () => {
  let service: HistoricSearchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HistoricSearchService],
    }).compile();

    service = module.get<HistoricSearchService>(HistoricSearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
