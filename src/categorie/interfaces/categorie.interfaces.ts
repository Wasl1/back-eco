import * as mongoose from 'mongoose';

export interface categorie extends mongoose.Document {
    id: string;
    nom: string;
    description: string;
    date: Date;
  }