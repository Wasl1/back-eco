import { Injectable, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProduitsInterface } from './interface/produits.interface';
import { debug } from 'console';

@Injectable()
export class ProduitsService {
    constructor(@InjectModel('Produits') private produitsModel: Model<ProduitsInterface>) {}

    async find(options: object): Promise<ProduitsInterface> {
        return await this.produitsModel.find(options).populate('categorie').exec();
    }

    async findAll(): Promise<ProduitsInterface[]> {
        return await this.produitsModel.find().populate('categorie').sort('-_id').exec();
    }

    async findById(ID: number): Promise<ProduitsInterface> {
        return await this.produitsModel.findById(ID).populate('categorie').exec();
    }

    async getLastProduits(): Promise<ProduitsInterface[]> {
        return await this.produitsModel.find().sort('-_id').populate('categorie').limit(10).exec();
    }

    async getProduitsCustomised(page: number): Promise<ProduitsInterface[]> {
        return await this.produitsModel.find({}, null, {limit: 20, skip: page}).populate('categorie').sort('-_id').exec();
    }

    async getUserWhoVoteProduit(id_produits: number) {
        return await this.produitsModel.findById(id_produits).populate('vote').exec();
    }

    async getUserWhoFavoriteProduit(id_produits: number) {
        return await this.produitsModel.findById(id_produits).populate('favoris').exec();
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

        return await this.produitsModel.findByIdAndUpdate(ID, newValue, {new: true}).exec();
    }

    async updateLancer(ID: number, lancement:any){
        return await this.produitsModel.findByIdAndUpdate(ID, {$addToSet:{historique: {lancer: lancement}}}, {safe: true, upsert:true}, err =>{
            if(err){console.log(err);
            }
        })        
    }

    async updateArchiver(ID: number, archive:any){
        return await this.produitsModel.findByIdAndUpdate(ID, {$addToSet:{historique: {archiver: archive}}}, {safe: true, upsert:true}, err =>{
            if(err){console.log(err);
            }
        })        
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
            }else{
                console.log("Nouvelles images ajoutées");
            }
        }).exec();
    }

    async updateDeleteImage(ID: number, pic_name: any){
        return await this.produitsModel.findByIdAndUpdate(ID, {$pull: {images: {"$in": pic_name}}}, {safe: true, multi: true}, err =>{
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

    async updateMultipleEtat(id_produits: any, etat: ProduitsInterface){
        return await this.produitsModel.updateMany({_id: {$in: id_produits}},{'etat': etat},{multi: true, upsert: true});
    }

    async decrementQuantite(ID: number, qteProduit: number): Promise<ProduitsInterface>{
        return await this.produitsModel.findByIdAndUpdate(ID, {$inc : {'quantite': qteProduit}}).exec();
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

    async deleteMultiple(id_produits: any): Promise<string>{
        await this.produitsModel.deleteMany({_id: {$in: id_produits}}).exec();
        return 'Produits supprimés';
    }

    async search(query: string){
        return await this.produitsModel.esSearch({ query_string: { query: "*"+query+"*" }})
        .then(res => res.hits.hits.map(hit => {
            return hit['_source'];
        }))
        .catch(err => { throw new HttpException(err, 500); });
    }

    async searchTitre(query: string){
        return await this.produitsModel.esSearch({ bool: { must: { wildcard: {titre: "*"+query+"*"} } }})
        .then(res => res.hits.hits.map(hit => {
            return hit['_source'];
        }))
        .catch(err => { throw new HttpException(err, 500); });
    }
}
