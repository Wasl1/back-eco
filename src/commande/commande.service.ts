import { Injectable } from '@nestjs/common';
import {Model} from 'mongoose';
import {InjectModel} from '@nestjs/mongoose';
import {commandes} from './interfaces/commandes.interfaces'
import {CreateDTO} from './dto/create.dto'


@Injectable() 
export class CommandesService {
    constructor(
        @InjectModel('commande') private commandesModel: Model<commandes>,
    ){}

    async getAll(){
        return await this.commandesModel.find();
    }
    
    async getCommande(commandeID): Promise<commandes[]> {
        const commande = await this.commandesModel.findById(commandeID).exec();
        return commande;
    }

    async AddCommande(createDTO: CreateDTO): Promise<commandes> {
        const product = new this.commandesModel(CreateDTO);
        return product.save();
        }
    

    async updateCommande(commandeID, createPostDTO: CreateDTO): Promise<commandes> {
        const editedCommande = await this.commandesModel.findByIdAndUpdate(commandeID, createPostDTO, { new: true });
        return editedCommande;
    }

    async deleteCommande(commandeID): Promise<commandes> {
        const deletedcommande = await this.commandesModel.findByIdAndRemove(commandeID);
        return deletedcommande;
    }

    async createCommande(createDTO: CreateDTO): Promise<commandes>{
        const commandeCreated = new this.commandesModel(createDTO);
        return await commandeCreated.save();
    }
}