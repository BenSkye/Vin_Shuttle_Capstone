import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
    .setTitle('VinShuttle API')
    .setDescription('VinShuttle service API documentation')
    .setVersion('1.0')
    .addTag('auth', 'Authentication')
    .addTag('users', 'User management')
    .addTag('vehicles', 'Vehicle management')
    .addTag('vehicle-categories', 'Vehicle category management')
    .addBearerAuth(
        {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'JWT',
            description: 'Enter JWT token',
            in: 'header',
        },
        'JWT-auth', // This name here is important for matching up with @ApiBearerAuth() in your controller!
    )
    .build();