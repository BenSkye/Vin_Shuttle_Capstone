import { Test, TestingModule } from '@nestjs/testing';
import { DraftingController } from './drafting.controller';

describe('DraftingController', () => {
  let controller: DraftingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DraftingController],
    }).compile();

    controller = module.get<DraftingController>(DraftingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
