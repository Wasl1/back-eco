import * as mongoose from 'mongoose';

export interface historicSearchInterface extends Document {
    readonly id_user: mongoose.Schema.Types.ObjectId;
    readonly userSearch : any;
}