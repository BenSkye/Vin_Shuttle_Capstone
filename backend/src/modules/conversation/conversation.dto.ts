// filepath: c:\Users\Admin\Desktop\FOR STUDY\SEP\Vin_Shuttle_Capstone\backend\src\modules\conversation\conversation.dto.ts
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsOptional } from "class-validator";

export class ICreateConversation {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    tripId: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    customerId: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    driverId: string;
}

export class IUpdateConversation {
    @ApiProperty()
    @IsOptional()
    @IsString()
    status?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    content?: string;
}