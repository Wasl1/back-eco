import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProduitsInterface } from './interface/produits.interface';
import { debug } from 'console';

@Injectable()
export class ProduitsService {
    constructor(@InjectModel('Produits') private produitsModel: Model<ProduitsInterface>) {}

    async find(options: object): Promise<ProduitsInterface> {
        return await this.produitsModel.find(options).exec();
    }

    async findAll(): Promise<ProduitsInterface[]> {
        return await this.produitsModel.find().exec();
    }

    async findById(ID: number): Promise<ProduitsInterface> {
        return await this.produitsModel.findById(ID).exec();
    }

    async getLastProduits(): Promise<ProduitsInterface[]> {
        return await this.produitsModel.find().sort('-_id').limit(10).exec();
    }

    async create(produitsInterface: any) {
        const createdTodo = new this.produitsModel(produitsInterface);
        return await createdTodo.save();  
    }

    async update(ID: number, newValue: ProduitsInterface): Promise<ProduitsInterface> {
        const produits = await this.produitsModel.findById(ID).exec();

        if (!produits._id) {
            debug('produit introuvable');
        }

        await this.produitsModel.findByIdAndUpdate(ID, newValue).exec();
        return await this.produitsModel.findById(ID).exec();
    }

    async updateAddImage(ID: number, id_user: any){
        return await this.produitsModel.findByIdAndUpdate(ID, {$addToSet: {images: id_user}}, {safe: true, upsert: true}, err =>{
            if(err){console.log(err);
            }else{
                console.log("Nouvelles images ajoutées");
            }
        }).exec();
    }

    async updateDeleteImage(ID: number, id_user: any){
        return await this.produitsModel.findByIdAndUpdate(ID, {$pull: {images: {"$in": id_user}}}, {safe: true, multi: true}, err =>{
            if(err){console.log(err);
            }else{
                console.log("Images supprimées");
            }
        }).exec();
    }

    async updateFavorisAdd(ID: number, id_user: any){
        return await this.produitsModel.findByIdAndUpdate(ID, {$addToSet: {favoris: id_user}}, {safe: true, upsert: true}, err => {
            if(err){console.log(err);
            }else{
                console.log("favoris ajouté");
            }
        }).exec();
    }

    async updateFavorisRemove(ID: number, id_user: any){
        return await this.produitsModel.findByIdAndUpdate(ID, {$pull: {favoris: id_user}}, {safe: true, multi: true}, err => {
            if(err){console.log(err);
            }else{
                console.log("favoris annulé");
            }
        }).exec();
    }

    async updateVoteAdd(ID: number, id_user: any){
        return await this.produitsModel.findByIdAndUpdate(ID, {$addToSet: {vote: id_user}}, {safe: true, upsert: true}, err => {
            if(err){console.log(err);
            }else{
                console.log("vote ajouté");
            }
        }).exec();
    }

    async updateVoteRemove(ID: number, id_user: any){
        return await this.produitsModel.findByIdAndUpdate(ID, {$pull: {vote: id_user}}, {safe: true, multi: true}, err => {
            if(err){console.log(err);
            }else{
                console.log("vote annulé");
            }
        }).exec();
    }

    async incrementView(ID: number): Promise<ProduitsInterface>{
        return await this.produitsModel.findByIdAndUpdate(ID, {$inc : {'vu': 1}}).exec();
    }

    async delete(ID: number): Promise<string> {
        try {
            await this.produitsModel.findByIdAndRemove(ID).exec();
            return 'Le produit a été supprimé';
        }
        catch (err){
            debug(err);
            return 'Impossible de faire la suppression';
        }
    }

    async deleteMany(id_produits: any): Promise<string>{
        await this.produitsModel.deleteMany({_id: {$in: id_produits}}).exec();
        return 'Produits supprimés';
    }
}
