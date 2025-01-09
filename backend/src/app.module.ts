import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DraftingModule } from './drafting/drafting.module';

@Module({
  imports: [DraftingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
