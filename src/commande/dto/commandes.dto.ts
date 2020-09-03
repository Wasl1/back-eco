import * as mongoose from 'mongoose';

export class CommandeDTO {
numero_commande: String;
readonly id_user: mongoose.Schema.Types.ObjectId;
readonly client: string;
readonly adresse: string;
readonly note_delivrance: string;
readonly etat: string;
readonly email:string;
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
readonly curency:string;
}