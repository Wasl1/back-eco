import { Module } from '@nestjs/common';
import { CommandeController } from './commande.controller';
import { CommandesService } from './commande.service';

import { MongooseModule } from '@nestjs/mongoose';
import { commandesSchema } from './schemas/commandes.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{
      name:'commande',
      schema:commandesSchema,
      collection:'commande'
    }
  ]),],
  controllers: [CommandeController],
  providers: [CommandesService]
})
export class CommandeModule {}
