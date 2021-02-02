import * as mongoose from 'mongoose';

const Action = {
    type : String,
    enum : ['CREATE', 'READ', 'DELETE', 'UPDATE']
}

const Access = {
    action : {
        type : [Action],
    }
}

export const PermissionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false
    }, 
    accesses : {
        type : [Access]
    }
});
