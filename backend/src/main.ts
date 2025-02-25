import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { swaggerConfig } from 'src/config/swagger.config';
// import * as fs from 'fs';
// import * as path from 'path';

// const httpsOptions = {
//   key: fs.readFileSync('./secrets/cert.key'),
//   cert: fs.readFileSync('./secrets/cert.crt'),
// };

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true /*httpsOptions*/ });
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'VinShuttle API Docs',
  });
  //log link to swagger
  console.log(`Swagger UI is running on http://localhost:${process.env.PORT ?? 2028}/api-docs`); // thêm chữ s vào nếu muốn sài https
  await app.listen(process.env.PORT ?? 2028);
}
bootstrap();
