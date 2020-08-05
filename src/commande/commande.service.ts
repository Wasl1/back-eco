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
    
    async getPost(postID): Promise<commandes[]> {
        const post = await this.commandesModel
            .findById(postID)
            .exec();
        return post;
    }

    async AddCommande(createDTO: CreateDTO): Promise<commandes> {
        const product = new this.commandesModel()
        
        product.numero_commande = createDTO.numero_commande
        product.id_user = createDTO.id_user
        product.client = createDTO.client
        product.adresse = createDTO.adresse
        product.note_delivrance = createDTO.note_delivrance
        product.date_creation = createDTO.date_creation
        product.etat = createDTO.etat
        product.tracage = createDTO.tracage
        product.payment = createDTO.payment
        product.commandes = createDTO.commandes

        return product.save();
        }
    

    async editPost(postID, createPostDTO: CreateDTO): Promise<commandes> {
        const editedPost = await this.commandesModel
            .findByIdAndUpdate(postID, createPostDTO, { new: true });
        return editedPost;
    }

    async delete(postID): Promise<commandes> {
        const deletedPost = await this.commandesModel
            .findByIdAndRemove(postID);
        return deletedPost;
    }

    async createCommande(createDTO: CreateDTO): Promise<commandes>{
        const commandeCreated = new this.commandesModel(createDTO);
        return await commandeCreated.save();
    }
}