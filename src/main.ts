import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //serve static assets from the uploads/produits
  app.use(express.static(join(process.cwd(), './uploads/produits')));

  // CORS activé pour faire des demandes interdomaines
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
