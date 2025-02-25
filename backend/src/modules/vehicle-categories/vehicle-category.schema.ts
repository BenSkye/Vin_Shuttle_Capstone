import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';

export type VehicleCategoryDocument = HydratedDocument<VehicleCategory>;

@Schema({ collection: 'VehicleCategory', timestamps: true })
export class VehicleCategory {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  _id: string;

  @ApiProperty({ example: 'Xe điện 4 chỗ' })
  @Prop({ required: true, unique: true })
  name: string;

  @ApiProperty({ example: 'Danh mục xe 4 chỗ thông thường' })
  @Prop({ default: '' })
  description: string;

  @ApiProperty({ example: 4 })
  @Prop({ required: true })
  numberOfSeat: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export const VehicleCategorySchema = SchemaFactory.createForClass(VehicleCategory);
