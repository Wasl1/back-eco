import * as mongoose from 'mongoose';

export class CreateDTO {
numero_commande: String;
readonly id_user: Number;
readonly client: string;
readonly adresse: string;
readonly note_delivrance: string;
readonly date_creation: Date;
readonly etat: string;
readonly tracage:{};
readonly payment:{};
readonly commandes:[]
}