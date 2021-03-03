import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
let mexp = require('mongoose-elasticsearch-xp');
import * as validator from 'class-validator';

export const UsersSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    refreshToken: {
        type: String, default: null 
    },
    verification: {
        type: String,
        validate: validator.isUUID,
    },
    nom: {
        type: String,
        required: true
    },
    prenom: {
        type: String,
        required: true
    },
    sexe: {
        type: String,
        required: true
    },
    adresse: {
        type: String,
        required: true
    },
    ville: {
        type: String,
        required: true
    },
    pays: {
        type: String,
        required: true
    },
    codePostal: {
        type: String,
        required: true
    },
    tel: {
        type: String,
        required: true
    },

    role: {
        type: String,
        default: 'user'
    },
    avatar: {
        type: String,
        default: "defaultpic.png"
    }
});
UsersSchema.plugin(mexp);

// NOTE: Arrow functions are not used here as we do not want to use lexical scope for 'this'
UsersSchema.pre('save', function(next){
    let user = this;

    // Make sure not to rehash the password if it is already hashed
    if(!user.isModified('password')) return next();

    // Generate a salt and use it to hash the user's password
    bcrypt.genSalt(10, (err, salt) => {
        if(err) return next(err);

        bcrypt.hash(user.password, salt, (err, hash) => {

            if(err) return next(err);
            user.password = hash;
            next();
        });
    });
}); 

UsersSchema.methods.toJSON = function(){
    let obj = this.toObject();
    delete obj.password;
    return obj;
}