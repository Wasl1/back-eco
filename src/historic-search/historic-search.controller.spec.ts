import { Test, TestingModule } from '@nestjs/testing';
import { HistoricSearchController } from './historic-search.controller';

describe('HistoricSearch Controller', () => {
  let controller: HistoricSearchController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HistoricSearchController],
    }).compile();

    controller = module.get<HistoricSearchController>(HistoricSearchController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
