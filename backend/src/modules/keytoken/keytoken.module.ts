import { Module, Provider } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { KEYTOKEN_SERVICE } from 'src/modules/keytoken/keytoken.di-token';
import { KeyTokenSchema } from 'src/modules/keytoken/keytoken.schema';
import { KeyTokenService } from 'src/modules/keytoken/keytoken.service';


const dependencies: Provider[] = [
    { provide: KEYTOKEN_SERVICE, useClass: KeyTokenService },
]

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'KeyToken', schema: KeyTokenSchema }]),
    ],
    providers: [...dependencies],
    exports: [...dependencies, MongooseModule, KEYTOKEN_SERVICE]
})
export class KeytokenModule { }