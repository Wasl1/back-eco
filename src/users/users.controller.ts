import { Controller, Post, Body, Get, UseGuards, Put, UseInterceptors, Param, UploadedFile, Delete } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { editFileName, imageFileFilter } from './file-upload.utils';
import { diskStorage } from 'multer';

@Controller('users')
export class UsersController {

    constructor(private usersService: UsersService) { }

    @Get()
    public async getAllUsers() {
        const users = await this.usersService.findAll();
        return { users, total: users.length};
    }

    @Get('find')
    public async findOneUser(@Body() body) {
        const queryCondition = body;
        const users = await this.usersService.findOne(queryCondition);
        return users;
    }

    @Get('/:id')
    public async getUser(@Param() param){
        const user = await this.usersService.findById(param.id);
        return user;
    }
    
    @Post() 
    async create(@Body() createUserDto: CreateUserDto) {
        return await this.usersService.create(createUserDto);
    }

    @Put('/avatar/:id')
    @UseInterceptors(
        FileInterceptor('avatar', {
          storage: diskStorage({
            destination: './uploads',
            filename: editFileName,      
          }),
          fileFilter: imageFileFilter,
        }),
      )
    public async updateUserAvatar(@Param() param, @Body() body,  @UploadedFile() uploadAvatar: any) {   
        body = { avatar: uploadAvatar.filename};
        const user = await this.usersService.update(param.id, body);
        return user;
    }

    @Put('/:id')
    public async updateUSer(@Param() param, @Body() body){
        const user = await this.usersService.update(param.id, body);
        return user;
    }

    @Delete('/:id')
    public async deleteUser(@Param() param) {

        const user = await this.usersService.delete(param.id);
        return user;
    }
}
