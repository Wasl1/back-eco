import { Users } from './interface/users.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { Model } from 'mongoose';
export declare class UsersService {
    private userModel;
    constructor(userModel: Model<Users>);
    create(createUserDto: CreateUserDto): Promise<any>;
    findOne(options: object): Promise<Users>;
    findOneByUsername(username: any): Model<Users>;
    findAll(): Promise<Users[]>;
    findById(ID: number): Promise<Users>;
    update(ID: number, newValue: Users): Promise<Users>;
    delete(ID: number): Promise<string>;
}
