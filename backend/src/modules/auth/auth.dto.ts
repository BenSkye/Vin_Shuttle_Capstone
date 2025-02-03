import { ApiProperty } from "@nestjs/swagger";

export class customerLoginDto {
    @ApiProperty({
        description: 'Customer Phone Number',
        example: '0838683868'
    })
    phone: number
}