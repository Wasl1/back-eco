import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

export interface commandes extends Document {
    numero_commande: String;
    readonly id_user: string;
    readonly client: string;
    readonly adresse: string;
    readonly note_delivrance: string;
    readonly date_creation: Date;
    readonly etat: string;
    readonly tracage:{};
    readonly payment:{};
    readonly commandes:[]
} 