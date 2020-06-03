import { Injectable } from '@nestjs/common';
import { historicSearchInterface } from './interface/historicSearch.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class HistoricSearchService {
    constructor(@InjectModel('historicSearch') private historicSearchModel: Model<historicSearchInterface>) {}

    async create(historicSearchInterface: any) {
        const createdTodo = new this.historicSearchModel(historicSearchInterface);
        return await createdTodo.save();  
    }
}
