import * as mongoose from 'mongoose';
let mexp = require('mongoose-elasticsearch-xp');


export const historicSearchSchema = new mongoose.Schema({
    user : { 
        type : mongoose.Schema.Types.ObjectId,
        ref:'User',
        es_indexed: true,
    },
    userSearch : [
        {
            idSearch: {
                type: mongoose.Schema.Types.ObjectId,
                auto: true,
                _id: {type: false},
            },            
            keywords: {
                type: String, 
                required: true
            },
            date: {
                type: Date,
                default: Date.now,
                es_indexed: true
            }
        }
    ]
});

historicSearchSchema.plugin(mexp);