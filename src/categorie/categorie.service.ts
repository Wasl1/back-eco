import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { categorieInterface } from './interfaces/categorie.interfaces'
import { categorieDto } from './dto/categorie.dto'

@Injectable()
export class categorieService {
  constructor(@InjectModel('categorie') private readonly categorieModel: Model<categorieInterface>) {}

  async insertcategorie(CreateDto: categorieDto): Promise<categorieInterface> {
    const newcategorie = new this.categorieModel(CreateDto);
    const result = await newcategorie.save();
    return result;
  }

  async getcategorie(): Promise<categorieInterface[]> {
    const categorie = await this.categorieModel.find().exec();
    return categorie;
  }

  async getSinglecategorie(categorieId): Promise<categorieInterface> {
    const categorie = await this.categorieModel.findById(categorieId).exec();
    return categorie;
  }

  async updatecategorie(categorieId, CreateDto: categorieDto): Promise<categorieInterface> {
    const updatedcategorie = await this.categorieModel.findByIdAndUpdate(categorieId, CreateDto, {new: true });
    return updatedcategorie;
  }

  async deletecategorie(categorieId): Promise<categorieInterface> {
    const result = await this.categorieModel.findByIdAndRemove(categorieId);
    return result;
  }

}