import { Test, TestingModule } from '@nestjs/testing';
import { CommandesService } from './commande.service';

describe('CommandeService', () => {
  let service: CommandesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommandesService],
    }).compile();

    service = module.get<CommandesService>(CommandesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
