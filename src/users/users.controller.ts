import { Controller, Post, Body, Get, UseGuards, Put, UseInterceptors, Param, UploadedFile, Delete, Query, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { editFileName, imageFileFilter } from './file-upload.utils';
import { diskStorage } from 'multer';
import { transporter, nodemailer, email } from "src/templates/template.mail";
import { printer, docDefinitionFacture } from "src/templates/template.pdf";
import { Roles } from './../auth/decorators/roles.decorator';
import { ApiOperation, ApiOkResponse, ApiBearerAuth, ApiHeader} from '@nestjs/swagger';
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

    @Get('/test/test')
    @UseGuards(AuthGuard('jwt'))
    @Roles('user')
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({})
    public async testAuthRoute(){
        return {
            message: 'Mess hafa ndray'
        }
    }

    @Get('/test/test1')
    @UseGuards(AuthGuard('jwt'))
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({summary: 'A private route for check the auth',})
    @ApiHeader({
        name: 'Bearer',
        description: 'the token we need for auth.'
    })
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({})
    public async testAuthRoute1(){
        return {
            message: 'Mess hafa ndray'
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

    @Put('/:id')
    @UseInterceptors(
        FileInterceptor('avatar', {
          storage: diskStorage({
            destination: './uploads/avatars',
            filename: editFileName,      
          }),
          fileFilter: imageFileFilter,
        }),
      )
    public async updateUSer(@Param() param, @Body() body, @UploadedFile() uploadAvatar: any){
        if(uploadAvatar){
            body['avatar'] = uploadAvatar.filename;
            const user = await this.usersService.update(param.id, body);
            return user
        }else{
            const user = await this.usersService.update(param.id, body);
            return user
        }
    }

    @Delete('/:id')
    public async deleteUser(@Param() param) {
        const user = await this.usersService.findById(param.id);
        let avatar = user['avatar'];
        const fs = require('fs-extra');
        fs.remove("./uploads/avatars/"+avatar+"", err => {
            console.log('succes');
        const user = this.usersService.delete(param.id);
        return user;
        });
        return user;
    }
}
