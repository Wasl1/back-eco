import { Injectable, HttpException } from '@nestjs/common';
import { historicSearchInterface } from './interface/historicSearch.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { debug } from 'console';

@Injectable()
export class HistoricSearchService {
    constructor(@InjectModel('historicSearch') private historicSearchModel: Model<historicSearchInterface>) {}

    async findAll(): Promise<historicSearchInterface[]> {
        return await this.historicSearchModel.find().sort('-_id').exec();
    }

    async find(options: object): Promise<historicSearchInterface> {
        return await this.historicSearchModel.find(options).exec();
    }

    async addUserSearch(id_user: number, userSearch:any){
        return await this.historicSearchModel.findOneAndUpdate({user: id_user}, {$addToSet:{userSearch: userSearch}}, {safe: true, upsert:true, new: true}, err =>{
            if(err){console.log(err);
            }
        })        
    }

    async delete(ID: number): Promise<string> {
        try {
            await this.historicSearchModel.findByIdAndRemove(ID).exec();
            return 'Historique supprimé';
        }
        catch (err){
            debug(err);
            return 'Impossible de faire la suppression';
        }
    }

    async EsSearchHistorique(query: string){
        return await this.historicSearchModel.esSearch({ query_string: { query: "*"+query+"*" }})
        .then(res => res.hits.hits.map(hit => {
            return hit['_source'];
        }))
        .catch(err => { throw new HttpException(err, 500); });
    }
}
