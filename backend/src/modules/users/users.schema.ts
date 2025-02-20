import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { UserRole, UserStatus } from "src/share/enums/user.enum";

export type UserDocument = HydratedDocument<User>;

@Schema({ collection: 'Users', timestamps: true })
export class User {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    phone: string;

    @Prop({ default: '' })
    email: string;

    @Prop({ type: String })
    avatar: string

    @Prop()
    password?: string;

    @Prop({ enum: UserRole, default: UserRole.CUSTOMER })
    role: string;

    @Prop({ enum: UserStatus, default: UserStatus.ACTIVE })
    status: string;

}

export const UserSchema = SchemaFactory.createForClass(User); 