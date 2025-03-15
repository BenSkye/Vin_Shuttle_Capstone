import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ _id: false })
export class Position {
    @Prop({ required: true, type: Number })
    lat: number;

    @Prop({ required: true, type: Number })
    lng: number;
}
export const PositionSchema = SchemaFactory.createForClass(Position);


@Schema({ _id: false })
class StartOrEndPoint {
    @Prop({ required: true, type: PositionSchema })
    position: Position;

    @Prop({ required: true, type: String })
    address: string;
}
export const StartOrEndPointSchema = SchemaFactory.createForClass(StartOrEndPoint);
