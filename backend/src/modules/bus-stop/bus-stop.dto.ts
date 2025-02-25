import { IsString, IsNotEmpty, IsEnum, IsObject, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PositionDto {
    @ApiProperty({
        description: 'Latitude of the bus stop',
        example: 21.028511
    })
    @IsNumber()
    lat: number;

    @ApiProperty({
        description: 'Longitude of the bus stop',
        example: 105.804817
    })
    @IsNumber()
    lng: number;
}

export class CreateBusStopDto {
    @ApiProperty({
        description: 'Name of the bus stop',
        example: 'Vincom Center Ba Trieu'
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        description: 'Description of the bus stop',
        required: false,
        example: 'Main entrance of Vincom Center Ba Trieu'
    })
    @IsString()
    description?: string;

    @ApiProperty({
        description: 'Geographic position of the bus stop',
        type: PositionDto
    })
    @IsObject()
    @IsNotEmpty()
    position: {
        lat: number;
        lng: number;
    };

    @ApiProperty({
        description: 'Status of the bus stop',
        enum: ['active', 'inactive'],
        example: 'active'
    })
    @IsEnum(['active', 'inactive'])
    status: string;

    @ApiProperty({
        description: 'Physical address of the bus stop',
        required: false,
        example: '191 Ba Trieu, Hai Ba Trung, Ha Noi'
    })
    @IsString()
    address?: string;
}

export class UpdateBusStopDto {
    @ApiProperty({
        description: 'Name of the bus stop',
        required: false,
        example: 'Vincom Center Ba Trieu'
    })
    @IsString()
    name?: string;

    @ApiProperty({
        description: 'Description of the bus stop',
        required: false,
        example: 'Main entrance of Vincom Center Ba Trieu'
    })
    @IsString()
    description?: string;

    @ApiProperty({
        description: 'Geographic position of the bus stop',
        required: false,
        type: PositionDto
    })
    @IsObject()
    position?: PositionDto;

    @ApiProperty({
        description: 'Status of the bus stop',
        required: false,
        enum: ['active', 'inactive'],
        example: 'active'
    })
    @IsEnum(['active', 'inactive'])
    status?: string;

    @ApiProperty({
        description: 'Physical address of the bus stop',
        required: false,
        example: '191 Ba Trieu, Hai Ba Trung, Ha Noi'
    })
    @IsString()
    address?: string;
}