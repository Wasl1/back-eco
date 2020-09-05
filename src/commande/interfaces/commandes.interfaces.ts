import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';

export interface commandesInterfaces extends Document {
    numero_commande: String;
    readonly id_user: String;
    readonly client: string;
    readonly adresse: string;
    readonly note_delivrance: string;
    readonly date_creation: Date;
    readonly etat: string;
    readonly tracage:{};
    readonly payment:{};
    readonly commandes:[];
    /*readonly email:string;
    readonly tel:string;
    readonly estimation_delivrance:string;
    readonly methode:string;
    readonly transaction_id:string;
    readonly amount:number;
    readonly codepromo:string;
    readonly id_produit:mongoose.Schema.Types.ObjectId;
    readonly title:string;
    readonly quantite:number;
    readonly prix_unitaire:number;
    readonly curency:string;*/
} 