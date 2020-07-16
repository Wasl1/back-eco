import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { categorieController } from './categorie.controller';
import { categorieService } from './categorie.service';
import { categorieSchema } from './schemas/categorie.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'categorie', schema: categorieSchema }])],
  controllers: [categorieController],
  providers: [categorieService],
})
export class categorieModule {}
