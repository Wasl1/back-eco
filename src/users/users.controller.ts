import { Controller, Post, Body, Get, UseGuards, Put, Param, Delete, HttpException, Res, HttpCode, HttpStatus, Request } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { transporter, nodemailer, email } from "src/templates/template.mail";
import { printer, docDefinitionFacture } from "src/templates/template.pdf";
import { Roles } from './../auth/decorators/roles.decorator';
import { ApiOkResponse, ApiBearerAuth} from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { async } from 'rxjs/internal/scheduler/async';
import { uploadProductImages, resizerImages} from "src/ImageConverter/ImageStorage";
var sizeOf = require("image-size");
const fs = require('fs-extra');
var glob = require("glob");

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @Get()
    //@UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({})
    public async getAllUsers() {
        const users = await this.usersService.findAll();
        return { users, total: users.length};
    }

    @Get('find')
    //@UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({})
    public async findOneUser(@Body() body) {
        const queryCondition = body;
        const users = await this.usersService.findOne(queryCondition);
        return users;
    }

    @Get('/:id')
    //@UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({})
    public async getUser(@Param() param){
        const user = await this.usersService.findById(param.id);
        return user;
    }

    @Get('/recherche/searchUser')
    // @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({})
    public async esSearchUser(@Body('search_user') search_user: string){   
        const results = await this.usersService.userSearch(search_user);
        return results;
    }

    @Get('/routes/user')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('user', 'admin')
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({})
    public async testAuthRoute(){
        return {
            message: 'for user and admin'
        }
    }

    @Get('/routes/admin')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({})
    public async testAuthRoute1(){
        return {
            message: 'admin only'
        }
    }
    
    @Post() 
    // @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('user', 'admin')
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({})
    public async create(@Body() createUserDto: CreateUserDto, @Body() body) {
        const username = await this.usersService.findOneByUsernameEs(body.username);
        const email = await this.usersService.findOneByEmailEs(body.email);
        if(username[0] == undefined && email[0] == undefined){
            return await this.usersService.create(createUserDto);
        } else if (username[0] != undefined){
            throw new HttpException('Username existe déjà', HttpStatus.OK);
        } else {
            throw new HttpException('Email existe déjà', HttpStatus.OK);
        }
    }

    @Post('sendMail')
    //@UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('user', 'admin')
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({})
    public async sendMail(@Body() body){
        let info = await transporter.sendMail({
            from: '"E-commerce GWERT" <foo@example.com>',
            to: body.mail, 
            subject: "MAIL", 
            text: "Test de mail", 
            html: email(body.nom, body.compagnie, body.phone, body.message),
          });
        
          console.log("Message envoyé: %s", info.messageId);
          console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }

    @Post('sendMailMultiple')
    //@UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('user', 'admin')
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({})
    public async sendMailMultiple(@Body() body){
        let info = await transporter.sendMail({
            from: '"E-commerce GWERT" <foo@example.com>',
            bcc: body.mail, 
            subject: "MAIL MULTIPLE", 
            text: "Test de mail multpiple", 
            html: email(body.nom, body.compagnie, body.phone, body.message),
          });
        
          console.log("Message envoyé: %s", info.messageId);
          console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }

    @Post('/sendMail/PdfGenerated')
    //@UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('user', 'admin')
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({})
    public async generatePDF(@Body() body, @Res() res) {
    
        const pdfDoc = printer.createPdfKitDocument(docDefinitionFacture);
        let chunks = [];
        pdfDoc.on('data', (chunk) => {chunks.push(chunk);});
        pdfDoc.on('end', () =>{
        let pdfData = Buffer.concat(chunks);

        let info = transporter.sendMail({
            from: '"E-commerce GWERT" <foo@example.com>', 
            bcc: body.mail, 
            subject: "Ecommerce", 
            text: "Mail avec pdf", 
            html: email(body.nom, body.compagnie, body.phone, body.message), 
            attachments:[
                {
                    filename: 'eco.pdf',
                    content: pdfData
                }
            ],
          });
          return info.then(() => {
            console.log("email envoyé");
            }).catch(error => {
                console.error("Une erreur s'est produite lors de l'envoi de l'e-mail:", error);
            });
        });
        pdfDoc.end();
    }

    @Post('/sendMailMultiple/PdfGenerated')
    //@UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('user', 'admin')
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({})
    public async sendMailPdfMultiple(@Body() body, @Res() res) {
    
        const pdfDoc = printer.createPdfKitDocument(docDefinitionFacture);
        let chunks = [];
        pdfDoc.on('data', (chunk) => {chunks.push(chunk);});
        pdfDoc.on('end', () =>{
        let pdfData = Buffer.concat(chunks);

        let info = transporter.sendMail({
            from: '"E-commerce GWERT" <foo@example.com>', 
            bcc: body.mail, 
            subject: "Ecommerce", 
            text: "Mail multiple avec pdf", 
            html: email(body.nom, body.compagnie, body.phone, body.message), 
            attachments:[
                {
                    filename: 'eco.pdf',
                    content: pdfData
                }
            ],
          });
          return info.then(() => {
            console.log("email envoyé");
            }).catch(error => {
                console.error("Une erreur s'est produite lors de l'envoi de l'e-mail:", error);
            });
        });
        pdfDoc.end();
    }

    @Put('/update/:id')
    //@UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('user', 'admin')
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({})
    public async updateUSer(@Param() param, @Body() body, @Request() req, @Res() res){
        if(req.body.avatar){
            let filename;
            filename = req.body.avatar.map(file => file.original.filename);            
            const useravatar = await this.usersService.findById(param.id);
            let avatar = useravatar['avatar'];

            await new Promise((resolve) => {
                let that = this;
                setTimeout(function(){
                    let dimensions = sizeOf('uploads/avatars/'+filename[0]);
                    if(dimensions.width < 200 && dimensions.height < 300){
                        let image = filename[0].split("-")
                        glob(`**uploads/avatar/${image[0]}*`, function(err, files) {
                            if (err) throw err;
                            for (const file of files) {
                                fs.unlink(file);
                            }
                        });
                        res.send("error: width < 180 or height < 240");
                    } else{
                        glob(`**uploads/avatars/${avatar}*`, function(err, files) {
                            if (err) throw err;
                            for (const file of files) {
                                fs.unlink(file);
                            }
                        });
                        filename = req.body.avatar.map(file => file.hd.filename.split("-"));
                        body['avatar'] = filename[0][0];
                        const user = that.usersService.update(param.id, body);
                        res.send("User modifié");
                        return user;
                    }
                }, 1500);

            });
            
        }else{
            const avatar = await this.usersService.findById(param.id);
            body["avatar"] = avatar.avatar;
            const user = await this.usersService.update(param.id, body);
            res.send("User modifié");
            return user;
        }
    }

    @Delete('/:id')
    //@UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('user', 'admin')
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({})
    public async deleteUser(@Param() param, @Res() res) {
        const user = await this.usersService.findById(param.id);
        let avatar = user['avatar'];
        glob(`**uploads/avatar/${avatar}*`, function(err, files) {
            if (err) throw err;
            for (const file of files) {
                fs.unlink(file);
            }
        });
        res.send({message: "User suprrimé"});
        return this.usersService.delete(param.id);
    }
}
