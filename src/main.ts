import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as multer from 'multer';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(multer().any());

  app.enableCors({
    origin: '*',
  });

  await app.listen(3001, '0.0.0.0');
}
bootstrap();
