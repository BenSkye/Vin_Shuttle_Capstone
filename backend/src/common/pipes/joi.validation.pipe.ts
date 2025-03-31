import { PipeTransform, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ObjectSchema } from 'joi';

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(private schema: ObjectSchema) {}

  transform(value: any) {
    console.log('value', value);
    const { error, value: validatedValue } = this.schema.validate(value, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Validation failed',
          vnMessage: 'Lỗi field',
          errors: errorMessages,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return validatedValue;
  }
}
