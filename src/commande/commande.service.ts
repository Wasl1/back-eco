import { Injectable } from '@nestjs/common';

import {Model} from 'mongoose';
import {InjectModel} from '@nestjs/mongoose';

import {commandesInterfaces} from './interfaces/commandes.interfaces'
import {CreateDTO} from './dto/create.dto'


@Injectable() 
export class CommandesService {
    constructor(
        @InjectModel('commande') private commandesModel: Model<commandesInterfaces>,
    ){}

    async getAll(){
        return await this.commandesModel.find();
    }
    
    async getCommande(commandeID): Promise<commandesInterfaces[]> {
        const commande = await this.commandesModel.findById(commandeID).exec();
        return commande;
    }   

    async updateCommande(commandeID, createPostDTO: CreateDTO): Promise<commandesInterfaces> {
        const editedCommande = await this.commandesModel.findByIdAndUpdate(commandeID, createPostDTO, { new: true });
        return editedCommande;
    }

    async deleteCommande(commandeID): Promise<commandesInterfaces> {
        const deletedcommande = await this.commandesModel.findByIdAndRemove(commandeID);
        return deletedcommande;
    }

    async createCommande(createDTO: CreateDTO): Promise<commandesInterfaces>{
        const commandeCreated = new this.commandesModel(createDTO);
        return await commandeCreated.save();
    }

    
    async getid_commande(id_commandes: number) {
        return await this.commandesModel.findById(id_commandes).populate('id_produit').exec();
    }

}


  