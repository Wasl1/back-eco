import { User } from './interface/user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { Model } from 'mongoose';
export declare class UsersService {
    private userModel;
    constructor(userModel: Model<User>);
    create(createUserDto: CreateUserDto): Promise<any>;
    findOne(options: object): Promise<User>;
    findOneByUsername(username: any): Model<User>;
    findAll(): Promise<User[]>;
    findById(ID: number): Promise<User>;
    update(ID: number, newValue: User): Promise<User>;
    delete(ID: number): Promise<string>;
}
