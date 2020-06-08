import * as mongoose from 'mongoose';

export interface historicSearchInterface extends Document {
    readonly user: mongoose.Schema.Types.ObjectId;
    readonly userSearch : any;
}