import * as mongoose from 'mongoose';
let mexp = require('mongoose-elasticsearch-xp');

export const ProduitsSchema = new mongoose.Schema({
    titre: {
        type: String,
        required: true
    },
    description: {
        type: String, 
        required: true
    },
    marque: {
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
    vote: [
        {
            type: mongoose.Schema.Types.ObjectId, ref:'User'
        }
    ],
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
    etat: {
        type: String,
        default: "sandbox"
    },
    prix: {
        type: Object,
        required: true
    },
    garantie: {
        type: Number,
        required: true
    },
    vu: {
        type: Number,
        default: 0
    },
    provenance: {
        type: String,
        required: true
    },
    favoris: [
        {
            type: mongoose.Schema.Types.ObjectId, ref:'User'
        }
    ],
    historique: [
        
    ]
});

ProduitsSchema.plugin(mexp);


