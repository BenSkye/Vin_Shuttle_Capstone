import { DocumentBuilder } from '@nestjs/swagger';
import { HEADER } from 'src/share/interface';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('VinShuttle API')
  .setDescription('VinShuttle service API documentation')
  .setVersion('1.0')
  .addTag('auth', 'Authentication')
  .addTag('otp', 'OTP Check')
  .addTag('search', 'search vehicle for each service')
  .addTag('booking', 'customer booking service')
  .addTag('users', 'User management')
  .addTag('vehicles', 'Vehicle management')
  .addTag('vehicle-categories', 'Vehicle category management')
  .addTag('pricing', 'Pricing management')
  .addTag('scenic-routes', 'Scenic Routes management')
  .addTag('driver-schedules', 'Driver schedule management')
  .addTag('trip', 'Trip management')
  .addTag('tracking', 'tracking location of vehicle')
  .addTag('rating', 'rating management')
  .addTag('notification', 'Notification management')
  .addTag('conversation', 'Conversation management')
  .addTag('bus-stops', 'Bus Stop management')
  .addTag('bus-routes', 'Bus Route management')
  .addTag('share-route', 'Share Route management')


  .addBearerAuth(
    { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    HEADER.AUTHORIZATION, // Authorization header
  )

  .addBearerAuth(
    { type: 'apiKey', in: 'header', name: HEADER.CLIENT_ID },
    HEADER.CLIENT_ID,
  )
  .build();
