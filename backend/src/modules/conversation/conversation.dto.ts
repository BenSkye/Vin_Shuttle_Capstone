// filepath: c:\Users\Admin\Desktop\FOR STUDY\SEP\Vin_Shuttle_Capstone\backend\src\modules\conversation\conversation.dto.ts
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsOptional } from "class-validator";
import { ConversationStatus } from "src/share/enums/conversation.enum";

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

    @IsNotEmpty()
    timeToOpen: Date;

    @IsNotEmpty()
    timeToClose: Date;

    @IsOptional()
    status?: ConversationStatus

}

export class IUpdateConversation {
    @ApiProperty()
    @IsOptional()
    @IsString()
    status?: ConversationStatus;

    @ApiProperty()
    @IsOptional()
    @IsString()
    content?: string;
}