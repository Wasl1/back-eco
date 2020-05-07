import * as mongoose from 'mongoose';


export const ProduitsSchema = new mongoose.Schema({
    titre: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    categorie: {
        type: String,
        required: true
    },
    quantite: {
        type: Number,
        required: true
    },
    vote: {
        type: []
    },
    images: {
        type: [],
        required: true
    },
    detail_fabrication: {
      type: Object,
      required: true
    },
    detail_physique: {
        type: Object,
        required: true
    },
    prix: {
        type: Object,
        required: true
    },
    favoris: {
        type: [],
    }
});
