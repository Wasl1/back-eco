import * as mongoose from 'mongoose';

export interface categorieInterface extends mongoose.Document {
    id: string;
    readonly nom: string;
    readonly description: string;
    readonly date: Date;
  }