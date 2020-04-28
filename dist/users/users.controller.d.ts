import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getAllUsers(): Promise<{
        users: import("./interface/users.interface").Users[];
        total: number;
    }>;
    findOneUser(body: any): Promise<import("./interface/users.interface").Users>;
    getUser(param: any): Promise<import("./interface/users.interface").Users>;
    create(createUserDto: CreateUserDto): Promise<any>;
    updateUserAvatar(param: any, body: any, uploadAvatar: any): Promise<import("./interface/users.interface").Users>;
    updateUSer(param: any, body: any): Promise<import("./interface/users.interface").Users>;
    deleteUser(param: any): Promise<string>;
}