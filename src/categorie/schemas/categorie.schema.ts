import * as mongoose from 'mongoose';

export const categorieSchema = new mongoose.Schema({
  nom: { 
    type: String, 
    required: true 
  },

  description: { 
    type: String, 
    required: true 
  },

  date: { 
    type: Date, 
    default: Date.now 
  },
});