import { DocumentBuilder } from '@nestjs/swagger';
import { HEADER } from 'src/share/interface';

export const swaggerConfig = new DocumentBuilder()
    .setTitle('VinShuttle API')
    .setDescription('VinShuttle service API documentation')
    .setVersion('1.0')
    .addTag('auth', 'Authentication')
    .addTag('users', 'User management')
    .addTag('vehicles', 'Vehicle management')
    .addTag('vehicle-categories', 'Vehicle category management')
    .addTag('otp', 'OTP Check')
    .addTag('pricing', 'Pricing management')
    .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        HEADER.AUTHORIZATION // Authorization header
    )
    .build();