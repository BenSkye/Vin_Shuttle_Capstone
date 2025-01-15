import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:2025',
    methods: ['GET', 'POST'],
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 2025);
}
bootstrap();
