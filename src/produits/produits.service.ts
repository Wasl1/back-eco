import { Injectable, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProduitsInterface } from './interface/produits.interface';
import { debug } from 'console';

@Injectable()
export class ProduitsService {
    constructor(@InjectModel('Produits') private produitsModel: Model<ProduitsInterface>) {}

    async findAllProduits(): Promise<ProduitsInterface[]> {
        return await this.produitsModel.find().populate('categorie').sort('-_id').exec();
    }

    async findByIdProduit(ID: number): Promise<ProduitsInterface> {
        return await this.produitsModel.findById(ID).populate('categorie').exec();
    }

    async getLastProduits(): Promise<ProduitsInterface[]> {
        return await this.produitsModel.find().sort('-_id').populate('categorie').limit(10).exec();
    }

    async getUserWhoVoteProduit(id_produits: number) {
        return await this.produitsModel.findById(id_produits).populate('vote').exec();
    }

    async getUserWhoFavoriteProduit(id_produits: number) {
        return await this.produitsModel.findById(id_produits).populate('favoris').exec();
    }

    async createProduit(produitsInterface: any) {
        const createdTodo = new this.produitsModel(produitsInterface);
        return await createdTodo.save();  
    }

    async createMultipleProduit(produitsInterface: any) {
        // const createdTodo = new this.produitsModel(produitsInterface);
        // return await createdTodo.insertMany();  
        return await this.produitsModel.insertMany(produitsInterface);
        
    }

    async updateProduit(ID: number, newValue: ProduitsInterface): Promise<ProduitsInterface> {
        const produits = await this.produitsModel.findById(ID).exec();

        if (!produits._id) {
            debug('produit introuvable');
        }

        return await this.produitsModel.findByIdAndUpdate(ID, newValue, {new: true}).exec();
    }

    async updateLancer(ID: number, lancement:any){
        return await this.produitsModel.findByIdAndUpdate(ID, {$addToSet:{historique: {lancer: lancement}},"etat": "live"}, {safe: true, upsert:true}, err =>{
            if(err){console.log(err);
            }
        })        
    }

    async updateMultipleLancer(id_produits: any, lancement:any){
        return await this.produitsModel.updateMany({_id: {$in: id_produits}},{$addToSet:{historique: {lancer: lancement}},"etat": "live"},{multi: true, upsert: true});
    }

    async updateArchiver(ID: number, archive:any){
        return await this.produitsModel.findByIdAndUpdate(ID, {$addToSet:{historique: {archiver: archive}}, "etat": "archived"}, {safe: true, upsert:true}, err =>{
            if(err){console.log(err);
            }
        })        
    }

    async updateMultipleArchiver(id_produits: any, archive:any){
        return await this.produitsModel.updateMany({_id: {$in: id_produits}},{$addToSet:{historique: {archiver: archive}}, "etat": "archived"},{multi: true, upsert: true});
    }

    async updateModifier(ID: number, modification:any){
        return await this.produitsModel.findByIdAndUpdate(ID, {$addToSet: {"historique.$[].modifier": modification}}, {safe: true, upsert:true}, err =>{
            if(err){console.log(err);
            }
        })        
    }

    async updateAddImage(ID: number, pic_name: any){
        return await this.produitsModel.findByIdAndUpdate(ID, {$addToSet: {images: pic_name}}, {safe: true, upsert: true}, err =>{
            if(err){console.log(err);
            }
        }).exec();
    }

    async updateDeleteImage(ID: number, pic_name: any){
        return await this.produitsModel.findByIdAndUpdate(ID, {$pull: {images: {"$in": pic_name }}}, {safe: true, multi: true}, err =>{
            if(err){console.log(err);
            }
        }).exec();
    }

    async updateFavorisAdd(ID: number, id_user: any){
        return await this.produitsModel.findByIdAndUpdate(ID, {$addToSet: {favoris: id_user}}, {safe: true, upsert: true}, err => {
            if(err){console.log(err);
            }
        }).exec();
    }

    async updateFavorisRemove(ID: number, id_user: any){
        return await this.produitsModel.findByIdAndUpdate(ID, {$pull: {favoris: id_user}}, {safe: true, multi: true}, err => {
            if(err){console.log(err);
            }
        }).exec();
    }

    async updateVoteAdd(ID: number, id_user: any){
        return await this.produitsModel.findByIdAndUpdate(ID, {$addToSet: {vote: id_user}}, {safe: true, upsert: true}, err => {
            if(err){console.log(err);
            }
        }).exec();
    }

    async updateVoteRemove(ID: number, id_user: any){
        return await this.produitsModel.findByIdAndUpdate(ID, {$pull: {vote: id_user}}, {safe: true, multi: true}, err => {
            if(err){console.log(err);
            }
        }).exec();
    }

    async incrementView(ID: number): Promise<ProduitsInterface>{
        return await this.produitsModel.findByIdAndUpdate(ID, {$inc : {'vu': 1}}).exec();
    }

    async updateMultipleEtat(id_produits: any, etat: ProduitsInterface){
        return await this.produitsModel.updateMany({_id: {$in: id_produits}},{'etat': etat},{multi: true, upsert: true});
    }

    async decrementQuantite(ID: number, qteProduit: number): Promise<ProduitsInterface>{
        return await this.produitsModel.findByIdAndUpdate(ID, {$inc : {'quantite': qteProduit}}).exec();
    }

    async deleteProduit(ID: number): Promise<string> {
        try {
            await this.produitsModel.findByIdAndRemove(ID).exec();
        }
        catch (err){
            debug(err);
            return 'Impossible de faire la suppression';
        }
    }

    async deleteMultipleProduits(id_produits: any): Promise<string>{
        return await this.produitsModel.deleteMany({_id: {$in: id_produits}}).exec();
    }

    async searchProduit(query: string){
        return await this.produitsModel.esSearch({ query_string: { query: "*"+query+"*" }})
        .then(res => res.hits.hits.map(hit => {
            return hit['_source'];
        }))
        .catch(err => { throw new HttpException(err, 500); });
    }

    async searchTitre(titre: string){
        return await this.produitsModel.esSearch({ bool: { must: { wildcard: {titre: "*"+titre+"*"} } }})
        .then(res => res.hits.hits.map(hit => {
            return hit['_source'];
        }))
        .catch(err => { throw new HttpException(err, 500); });
    }
}
