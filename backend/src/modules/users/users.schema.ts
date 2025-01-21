import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { UserRole } from "src/modules/users/users.port";

export type UserDocument = HydratedDocument<User>;

@Schema({ collection: 'Users', timestamps: true })
export class User {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    phone: string;

    @Prop({ default: '' })
    email: string;

    @Prop()
    password?: string;

    @Prop({ enum: UserRole, default: UserRole.CUSTOMER })
    role: string;

}

export const UserSchema = SchemaFactory.createForClass(User); 