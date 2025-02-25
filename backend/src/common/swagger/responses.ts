import { ApiProperty } from '@nestjs/swagger';

export class ValidationFieldError {
  @ApiProperty({ example: 'name' })
  field: string;

  @ApiProperty({ example: 'Tên không được để trống' })
  message: string;
}

export class ValidationErrorResponse {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'Validation failed' })
  message: string;

  @ApiProperty({ type: [ValidationFieldError] })
  errors: ValidationFieldError[];
}

export class UniqueFieldError {
  @ApiProperty({ example: 'name' })
  field: string;

  @ApiProperty({ example: 'name đã tồn tại' })
  message: string;
}

export class UniqueErrorResponse {
  @ApiProperty({ example: 409 })
  statusCode: number;

  @ApiProperty({ example: 'Unique field violation' })
  message: string;

  @ApiProperty({ type: [UniqueFieldError] })
  errors: UniqueFieldError[];
}
