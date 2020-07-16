import { Controller, Post, Body, Get, UseGuards, Put, Param, Delete, Query, Res, HttpCode, HttpStatus, Request } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { transporter, nodemailer, email } from "src/templates/template.mail";
import { printer, docDefinitionFacture } from "src/templates/template.pdf";
import { Roles } from './../auth/decorators/roles.decorator';
import { ApiOkResponse, ApiBearerAuth} from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { createProduct} from "src/ImageConverter/ImageStorage";

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}

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

    @Get('/recherche/searchUser')
    public async esSearchUser(@Query('query') query: string){   
        const results = await this.usersService.userSearch(query);
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
    public async create(@Body() createUserDto: CreateUserDto) {
        return await this.usersService.create(createUserDto);
    }

    @Post('sendMail')
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
    public async updateUSer(@Param() param, @Body() body, @Request() req, @Res() res){
        if(req.body.avatar){
            let filename;
            await new Promise((resolve) => {
                createProduct(req, next => resolve());
                filename = req.body.avatar.map(file => file.original.filename.split("-"));
                body['avatar'] = filename[0][0];
                const user = this.usersService.update(param.id, body);
                res.send("User modifié");
                return user;
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
    public async deleteUser(@Param() param) {
        const user = await this.usersService.findById(param.id);
        let avatar = user['avatar'];
        const fs = require('fs-extra');
        var glob = require("glob");
        glob(`**uploads/avatar/${avatar}*`, function(err, files) {
            if (err) throw err;
            for (const file of files) {
                fs.unlink(file);
            }
        });
        return this.usersService.delete(param.id);
    }
}
