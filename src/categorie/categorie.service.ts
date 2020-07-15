import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { categorie } from './interfaces/categorie.interfaces'
import { CreatePostDTO } from './dto/categorie-post.dto'

@Injectable()
export class categorieService {
  constructor(@InjectModel('categorie') private readonly bookModel: Model<categorie>) {}

  async insertcategorie(CreatePostDTO: CreatePostDTO): Promise<categorie> {
    const newcategorie = new this.bookModel(CreatePostDTO);
    const result = await newcategorie.save();
    return result;
  }

  async getcategorie(): Promise<categorie[]> {
    const categorie = await this.bookModel.find().exec();
    return categorie;
  }

  async getSinglecategorie(categorieId): Promise<categorie> {
    const categorie = await this.bookModel
          .findById(categorieId)
          .exec();
    return categorie;
  }

  async updatecategorie(categorieId, CreatePostDTO: CreatePostDTO): Promise<categorie> {
    const updatedcategorie = await this.bookModel
            .findByIdAndUpdate(categorieId, CreatePostDTO, {new: true });
    return updatedcategorie;
  }

  async deletecategorie(categorieId): Promise<categorie> {
    const result = await this.bookModel.findByIdAndRemove(categorieId);
    if (!result) {
      throw new NotFoundException('Could not find categorie.');
    }
    return result;
  }

}