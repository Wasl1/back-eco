import * as mongoose from 'mongoose';
export class  ProduitsDto {
    readonly titre: string;
    readonly description: string;
    readonly marque: string;
    readonly categorie: mongoose.Schema.Types.ObjectId;
    readonly quantite: number;
    vote: any;
    images: any;

    readonly numero_model: string;
    readonly date_sortie: string;
    readonly poids: number;
    readonly longueur: number;
    readonly largeur: number;
    readonly taille: string;
    readonly couleur: string;
    readonly etat: string;
    readonly prix_normal: number;
    readonly prix_promotion: number;
    readonly garantie : number;
    readonly vu : number;
    readonly provenance : string;
    favoris: any;
    
    readonly acteur: mongoose.Schema.Types.ObjectId;
    readonly date_creation: Date;
    readonly lanceur: string;
    readonly date_lancement: Date;
    readonly modificateur: string;
    readonly date_modification: Date;
    readonly archiveur: string;
    readonly date_archive;

    readonly id_user: mongoose.Schema.Types.ObjectId;
    readonly idSearch: mongoose.Schema.Types.ObjectId;
    readonly keywords: string;
    readonly date_recherche: Date;

}