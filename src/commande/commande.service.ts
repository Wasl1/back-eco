import { Injectable } from '@nestjs/common';

import * as mongoose from 'mongoose';
import {Model} from 'mongoose';
import {InjectModel} from '@nestjs/mongoose';

import {commandesInterfaces} from './interfaces/commandes.interfaces'
import {CommandeDTO} from './dto/commandes.dto'
import { UsersSchema } from 'src/users/schema/users.schema';


@Injectable() 
export class CommandesService {
    constructor(
        @InjectModel('commande') private commandesModel: Model<commandesInterfaces>,
    ){}

    async createCommande(createDTO: CommandeDTO): Promise<commandesInterfaces>{
        const commandeCreated = new this.commandesModel(createDTO);
        return await commandeCreated.save();
    }

    async getAll(): Promise<commandesInterfaces[]>{
        const commande = await this.commandesModel.find()
        .populate('id_user')
        .populate('commandes.id_produit')
        .exec();
        return commande;
    }
    
    async getCommande(commandeID: number): Promise<commandesInterfaces[]> {
        // const User = mongoose.model('User', UsersSchema);
        const commande = await this.commandesModel.findById(commandeID)
        .populate('id_user')
        .populate('commandes.id_produit')
        .exec();
        return commande;
    }   
    
    async updateCommande(commandeID, createPostDTO: CommandeDTO): Promise<commandesInterfaces> {
        const editedCommande = await this.commandesModel.findByIdAndUpdate(commandeID, createPostDTO, { new: true });
        return editedCommande;
    }

    async updateProduitAdd(ID: number, id_produit: any){
        return await this.commandesModel.findByIdAndUpdate(ID, {$addToSet: {produit: id_produit}}, {safe: true, upsert: true}, err => {
            if(err){console.log(err);
            }else{
                console.log("produit ajouté");
            }
        }).exec();
    }

    async updateProduitRemove(ID: number, id_produit: any){
        return await this.commandesModel.findByIdAndUpdate(ID, {$pull: {produit: id_produit}}, {safe: true, multi: true}, err => {
            if(err){console.log(err);
            }else{
                console.log("produit annulé");
            }
        }).exec();
    }

    async deleteCommande(commandeID): Promise<commandesInterfaces> {
        const deletedcommande = await this.commandesModel.findByIdAndRemove(commandeID);
        return deletedcommande;
    }

}


  