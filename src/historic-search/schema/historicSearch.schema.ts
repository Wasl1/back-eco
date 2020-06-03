import * as mongoose from 'mongoose';

export const historicSearchSchema = new mongoose.Schema({
    id_user : { 
        type : mongoose.Schema.Types.ObjectId, ref:'User'
    },
    userSearch : [
        {
            idSearch: {
                type: mongoose.Schema.Types.ObjectId,
                index: true,
                required: true,
                auto: true
            },            
            keywords: {
                type: String, 
                required: true
            },
            date: {
                type: Date,
                default: Date.now
            }
        }
    ]
});