import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DraftingModule } from './drafting/drafting.module';
import { VehicleCategoryModule } from './modules/vehicle-categories/vehicle-category.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import mongodbConfig from 'src/config/mongodb.config';
import { MongooseModule } from '@nestjs/mongoose';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [mongodbConfig],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('mongodb.uri'),
        dbName: configService.get<string>('mongodb.database'),
      }),
      inject: [ConfigService],
    }),
    DraftingModule,
    VehicleCategoryModule,
    VehiclesModule,
    UsersModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
