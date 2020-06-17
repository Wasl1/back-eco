import { Controller, Post, Body, Get, UseGuards, Put, UseInterceptors, Param, UploadedFile, Delete, Query, Res } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { editFileName, imageFileFilter } from './file-upload.utils';
import { diskStorage } from 'multer';
const nodemailer = require('nodemailer');
import * as PdfPrinter from 'pdfmake';
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
    
    @Post() 
    public async create(@Body() createUserDto: CreateUserDto) {
        return await this.usersService.create(createUserDto);
    }

    @Post('sendMail')
    public async sendMail(@Body() body, @Res() res){
        const output = `
            <p>You have a new contact request</p>
            <h3>Contact Details</h3>
            <ul>  
            <li>Name: ${body.name}</li>
            <li>Company: ${body.company}</li>
            <li>Phone: ${body.phone}</li>
            </ul>
            <h3>Message</h3>
            <p>${body.message}</p>
        `;

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, 
            auth: {
                user: 'no-reply@yourdomain.com', 
                pass: 'password',  
            },
        });
        
        let info = await transporter.sendMail({
            from: '"E-commerce GWERT" <no-reply@yourdomain.com>',
            to: "test@qq.com", 
            subject: "Hello ✔", 
            text: "Hello world?", 
            html: output, 
          });
        
          console.log("Message sent: %s", info.messageId);
        
          console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }

    @Post('/sendMail/PdfGenerated')
    public async generatePDF(@Body() body, @Res() res) {
        const fonts = {
        Helvetica: {
            normal: 'Helvetica',
            bold: 'Helvetica-Bold',
            italics: 'Helvetica-Oblique',
            bolditalics: 'Helvetica-BoldOblique'
        }
        };
        const printer = new PdfPrinter(fonts);
    
        const docDefinition = {
        content: [
            {
            columns: [
                {
                image:
                    './uploads/logos/680.png',
                width: 50,
                },
                [
                {
                    text: '6587',
                    color: '#333333',
                    width: '*',
                    fontSize: 12,
                    alignment: 'right',
                    decoration: 'underline',
                    margin: [0, 0, 0, 15],
                },
                {
                    stack: [
                    {
                        columns: [
                        {
                            text: 'Date',
                            color: '#aaaaab',
                            bold: true,
                            width: '*',
                            fontSize: 12,
                            alignment: 'right',
                        },
                        {
                            text: '13 Juin 2020',
                            color: '#333333',
                            fontSize: 12,
                            alignment: 'right',
                            width: 100,
                            decoration: 'underline',
                        },
                        ],
                    },
                    ],
                },
                ],
            ],
            },
            {
            columns: [
                {
                text: 'Pay to the \n Order of',
                color: '#aaaaab',
                bold: true,
                fontSize: 14,
                alignment: 'left',
                margin: [0, 20, 0, 0],
                },
                {
                text: '\n           MERIKA Wasselin             ',
                color: '#333333',
                fontSize: 12,
                alignment: 'left',
                decoration: 'underline',
                margin: [0, 20, 0, 5],
                },
                {
                text: '$',
                color: '#aaaaab',
                bold: true,
                fontSize: 14,
                alignment: 'right',
                margin: [0, 20, 0, 5],
                },
                {
                text: '         1.000.000        ',
                color: '#333333',
                bold: true,
                fontSize: 14,
                alignment: 'right',
                margin: [0, 20, 0, 5],
                decoration: 'underline',
                },
            ],
            },
            '\n',
            {
            columns: [
                {
                text: '                         ROA HETSY                  ',
                color: '#333333',
                fontSize: 12,
                alignment: 'center',
                margin: [10, 0, 10, 0],
                decoration: 'underline',
                },
                {
                text: 'Dollars',
                bold: true,
                color: '#aaaaab',
                alignment: 'right',
                }
            ],
            },
            '\n\n',
            {
            columns: [
                {
                text: 'For',
                color: '#aaaaab',
                bold: true,
                fontSize: 14,
                alignment: 'left',
                margin: [0, 20, 0, 5],
                },
                {
                text: '     JOHN Franklin      ',
                color: '#333333',
                fontSize: 12,
                alignment: 'left',
                decoration: 'underline',
                margin: [0, 20, 0, 5],
                },
                {
                text: 'Signed',
                color: '#aaaaab',
                bold: true,
                fontSize: 14,
                alignment: 'right',
                //gauche, haut, droit, bas]
                margin: [0, 20, 100, 5],
                }
            ]
            },
        ],
        styles: {
            notesTitle: {
            fontSize: 10,
            bold: true,
            margin: [0, 50, 0, 3],
            },
            notesText: {
            fontSize: 10,
            },
        },
        defaultStyle: {
            columnGap: 20,
            font: 'Helvetica',
        },
        
        };
        const pdfDoc = printer.createPdfKitDocument(docDefinition);
        let chunks = [];
        pdfDoc.on('data', (chunk) => {chunks.push(chunk);});
        pdfDoc.on('end', () =>{
        let pdfData = Buffer.concat(chunks);

        const output = `
            <p>You have a new contact request</p>
            <h3>Contact Details</h3>
            <ul>  
            <li>Name: ${body.name}</li>
            <li>Company: ${body.company}</li>
            <li>Phone: ${body.phone}</li>
            </ul>
            <h3>Message</h3>
            <p>${body.message}</p>
        `;
        
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, 
            auth: {
                user: 'no-reply@yourdomain.com', 
                pass: 'password',  
            },
        });

        let info = transporter.sendMail({
            from: '"E-commerce GWERT" <no-reply@yourdomain.com>', 
            to: "test@qq.com", 
            subject: "Ecommerce", 
            text: "Hello world?", 
            html: output, 
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
