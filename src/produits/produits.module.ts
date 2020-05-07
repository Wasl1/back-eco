import { Module } from '@nestjs/common';
import { ProduitsService } from './produits.service';
import { ProduitsController } from './produits.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ProduitsSchema } from './schema/produits.schema';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'Produits', schema: ProduitsSchema}]),
    MulterModule.register({dest: './uploads/produits',})
  ],
  providers: [ProduitsService],
  controllers: [ProduitsController]
})
export class ProduitsModule {}
