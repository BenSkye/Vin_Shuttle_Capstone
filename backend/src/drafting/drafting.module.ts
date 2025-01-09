import { Module } from '@nestjs/common';
import { DraftingService } from './drafting.service';
import { DraftingController } from './drafting.controller';

@Module({
  providers: [DraftingService],
  controllers: [DraftingController]
})
export class DraftingModule {}
