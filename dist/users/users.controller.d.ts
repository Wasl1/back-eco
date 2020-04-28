import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getAllUsers(): Promise<{
        users: import("./interface/user.interface").User[];
        total: number;
    }>;
    findOneUser(body: any): Promise<import("./interface/user.interface").User>;
    getUser(param: any): Promise<import("./interface/user.interface").User>;
    create(createUserDto: CreateUserDto): Promise<any>;
    updateUserAvatar(param: any, body: any, uploadAvatar: any): Promise<import("./interface/user.interface").User>;
    updateUSer(param: any, body: any): Promise<import("./interface/user.interface").User>;
    deleteUser(param: any): Promise<string>;
}
