import * as mongoose from 'mongoose';

var autoIncrement = require('simple-mongoose-autoincrement');

export const commandesSchema = new mongoose.Schema({
    numero_commande: {
        type: Number,
        required: true,
    },

    id_user: {
        type: mongoose.Schema.Types.ObjectId, ref:'user'

    },


    client: {
        type: String,
        required: true,
    },

    adresse: {
        type: String,
        required: true,
    },

    note_delivrance: {
        type: String,
        required: true,
    },
    date_creation: {
        type: Date,
        default: Date.now,
        //es_indexed: true
    },

    etat:{
        type: String,
        required: true,
    },

    tracage:{
        email: {
            type: String,
            required: true,
        },

        tel: {
            type: String,
            required: true,
        },

        estimation_delivrance: {
            type: Date,
            required: true,
        }
    },

    payment:{
        methode: {
            type: String,
            required: true,
        },

        transaction_id: {
            type: String,
            required: true,
        },

        Amount: {
            type: Number,
            required: true,
        },

        codepromo:{
            type: String,
            required: true,
        }
    },

    commandes:[

        {
            id_produit: {
                type: mongoose.Schema.Types.ObjectId, ref:'produits'
            },
    
            title: {
                type: String,
                required: true,
            },
    
            quantite: {
                type: Number,
                required: true,
            },

            prix_unitaire:{
                type: Number,
                required: true,
            },

            curency:{
                type: String,
                required: true,
            }
        },
   ],

});

commandesSchema.plugin(autoIncrement, {field: 'numero_commande' /*with field name*/});
