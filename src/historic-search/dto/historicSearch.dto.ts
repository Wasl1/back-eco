import * as mongoose from 'mongoose';

export class historicSearchDto {
    readonly id_user: mongoose.Schema.Types.ObjectId;
    readonly idSearch: mongoose.Schema.Types.ObjectId;
    readonly keywords: string;
    readonly date_recherche: Date;
}