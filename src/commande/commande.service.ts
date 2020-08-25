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

    async deleteCommande(commandeID): Promise<commandesInterfaces> {
        const deletedcommande = await this.commandesModel.findByIdAndRemove(commandeID);
        return deletedcommande;
    }

}


  