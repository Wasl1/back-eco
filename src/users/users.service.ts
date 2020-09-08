import { Injectable, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Users } from './interface/users.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { Model } from 'mongoose';
import { debug } from 'console';
import { uploadProductImages, resizerImages} from "src/ImageConverter/ImageStorage";

@Injectable()
export class UsersService {
    constructor(@InjectModel('User') private userModel: Model<Users>) {}

    async create(createUserDto: CreateUserDto) {
        let createdUser = new this.userModel(createUserDto);
        return await createdUser.save();
     }

     async findOne(options: object): Promise<Users> {
        return await this.userModel.findOne(options).exec();
    }

    async findOneByUsername(username): Model<Users> {
        return await this.userModel.findOne({username: username});
    }

    async findAll(): Promise<Users[]> {
        return await this.userModel.find().exec();
    }

    async findById(ID: number): Promise<Users> {
        return await this.userModel.findById(ID).exec();
    }

    async update(ID: number, newValue: Users): Promise<Users> {
        const user = await this.userModel.findById(ID).exec();

        if (!user._id) {
            debug('user not found');
        }

        await this.userModel.findByIdAndUpdate(ID, newValue, {new: true}).exec();
        return await this.userModel.findById(ID).exec();
    }

    async delete(ID: number): Promise<string> {
        try {
            await this.userModel.findByIdAndRemove(ID).exec();
            return 'The user has been deleted';
        }
        catch (err){
            debug(err);
            return 'The user could not be deleted';
        }
    }

    async userSearch(search_user: string){
        return await this.userModel.esSearch({ query_string: { query: "*"+search_user+"*" }})
        .then(res => res.hits.hits.map(hit => {
            return hit['_source'];
        }))
        .catch(err => { throw new HttpException(err, 500); });
    }

    async useUploadResize(req, res, next){
        await new Promise((resolve, reject) => {
            uploadProductImages(req, res, err => err ? reject(err) : resolve());
        });

        await new Promise((resolve, reject) => {
            resizerImages(req, res, err => err ? reject(err) : resolve());
        });
        return next();
    }

    async useResize(req, res){
        await new Promise((resolve, reject) => {
            uploadProductImages(req, res, err => err ? reject(err) : resolve());
        });
        await new Promise((resolve, reject) => {
            resizerImages(req, res, err => err ? reject(err) : resolve());
        });
    }
}
