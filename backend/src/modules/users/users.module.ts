import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { USER_REPOSITORY, USER_SERVICE } from 'src/modules/users/users.di-token';
import { UsersRepository } from 'src/modules/users/users.repo';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/modules/users/users.schema';
import { ShareModule } from 'src/share/share.module';

const dependencies = [
  { provide: USER_SERVICE, useClass: UsersService },
  { provide: USER_REPOSITORY, useClass: UsersRepository }
]

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    ShareModule
  ],
  controllers: [UsersController],
  providers: [...dependencies],
  exports: [...dependencies]
})
export class UsersModule { }
