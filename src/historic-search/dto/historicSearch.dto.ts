import * as mongoose from 'mongoose';

export class historicSearchDto {
    readonly user: mongoose.Schema.Types.ObjectId;
    readonly idSearch: mongoose.Schema.Types.ObjectId;
    readonly keywords: string;
    readonly date_recherche: Date;
}