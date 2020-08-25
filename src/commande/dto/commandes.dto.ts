import * as mongoose from 'mongoose';

export class CommandeDTO {
numero_commande: String;
readonly id_user: any;
readonly client: string;
readonly adresse: string;
readonly note_delivrance: string;
readonly date_creation: Date;
readonly etat: string;
readonly tracage:string;
readonly payment:string;
readonly commandes: string; 
}