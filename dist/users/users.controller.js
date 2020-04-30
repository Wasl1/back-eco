"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const create_user_dto_1 = require("./dto/create-user.dto");
const users_service_1 = require("./users.service");
const platform_express_1 = require("@nestjs/platform-express");
const file_upload_utils_1 = require("./file-upload.utils");
const multer_1 = require("multer");
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async getAllUsers() {
        const users = await this.usersService.findAll();
        return { users, total: users.length };
    }
    deleteFile() {
        const fs = require('fs-extra');
        fs.remove('./uploads/cap-313a.png', err => {
            console.log('succes');
        });
    }
    async findOneUser(body) {
        const queryCondition = body;
        const users = await this.usersService.findOne(queryCondition);
        return users;
    }
    async getUser(param) {
        const user = await this.usersService.findById(param.id);
        return user;
    }
    async create(createUserDto) {
        return await this.usersService.create(createUserDto);
    }
    async updateUSer(param, body, uploadAvatar) {
        if (uploadAvatar) {
            body['avatar'] = uploadAvatar.filename;
            const user = await this.usersService.update(param.id, body);
            return user;
        }
        else {
            const user = await this.usersService.update(param.id, body);
            return user;
        }
    }
    async deleteUser(param) {
        const user = await this.usersService.findById(param.id);
        let avatar = user['avatar'];
        console.log('av', avatar);
        const fs = require('fs-extra');
        fs.remove("./uploads/avatars/" + avatar + "", err => {
            console.log('succes');
            const user = this.usersService.delete(param.id);
            return user;
        });
        return user;
    }
};
__decorate([
    common_1.Get(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getAllUsers", null);
__decorate([
    common_1.Get('files'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "deleteFile", null);
__decorate([
    common_1.Get('find'),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findOneUser", null);
__decorate([
    common_1.Get('/:id'),
    __param(0, common_1.Param()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUser", null);
__decorate([
    common_1.Post(),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "create", null);
__decorate([
    common_1.Put('/:id'),
    common_1.UseInterceptors(platform_express_1.FileInterceptor('avatar', {
        storage: multer_1.diskStorage({
            destination: './uploads/avatars',
            filename: file_upload_utils_1.editFileName,
        }),
        fileFilter: file_upload_utils_1.imageFileFilter,
    })),
    __param(0, common_1.Param()), __param(1, common_1.Body()), __param(2, common_1.UploadedFile()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateUSer", null);
__decorate([
    common_1.Delete('/:id'),
    __param(0, common_1.Param()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteUser", null);
UsersController = __decorate([
    common_1.Controller('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
exports.UsersController = UsersController;
//# sourceMappingURL=users.controller.js.map