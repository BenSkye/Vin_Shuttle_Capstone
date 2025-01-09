import { Test, TestingModule } from '@nestjs/testing';
import { DraftingService } from './drafting.service';

describe('DraftingService', () => {
  let service: DraftingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DraftingService],
    }).compile();

    service = module.get<DraftingService>(DraftingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
