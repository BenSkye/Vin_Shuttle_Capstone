import { ApiProperty } from "@nestjs/swagger"
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator"

export class ICreateNotification {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    received: string

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    title: string

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    body: string

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    isRead?: boolean
}

export class IUpdateNotification {
    @ApiProperty()
    @IsOptional()
    @IsString()
    title?: string

    @ApiProperty()
    @IsOptional()
    @IsString()
    body?: string

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    isRead?: boolean
}