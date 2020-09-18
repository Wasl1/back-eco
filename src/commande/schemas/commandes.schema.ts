import * as mongoose from 'mongoose';

var autoIncrement = require('simple-mongoose-autoincrement');
let pageinate = require('mongoose-paginate-v2');

let mexp = require('mongoose-elasticsearch-xp');

/*id_produit:{
    type: mongoose.Schema.Types.ObjectId, ref:'User'
},*/

export const commandesSchema = new mongoose.Schema({
    numero_commande: {
        type: Number,
        required: true,
    },

    createAt:{
        type: false
    },

    updateAt:{
        type: false
    },

    id_user: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref:'User',
    },],
    
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
        es_indexed: true
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
            type: String,
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

        amount: {
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
            _id: false,

            id_produit: [{
                type: mongoose.Schema.Types.ObjectId, ref:'Produits'
            }],
    
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
   ]
    },

{
    toJSON: {
      versionKey: false,
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.id;
        delete ret.updateAt;
      },
    }
}

);

commandesSchema.plugin(autoIncrement, {field: 'numero_commande'/*with field name*/});
commandesSchema.plugin(pageinate);

commandesSchema.plugin(mexp);
