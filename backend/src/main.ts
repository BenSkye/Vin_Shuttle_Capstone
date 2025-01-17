import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { swaggerConfig } from 'src/config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:2025',
    methods: ['GET', 'POST'],
    credentials: true,
  });
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'VinShuttle API Docs'
  });
  //log link to swagger
  console.log(`Swagger UI is running on http://localhost:${process.env.PORT ?? 2025}/api-docs`);
  await app.listen(process.env.PORT ?? 2025);
}
bootstrap();
