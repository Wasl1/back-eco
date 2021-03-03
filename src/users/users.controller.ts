import { Controller, Post, Body, Get, UseGuards, Put, Param, Delete, HttpException, Res, HttpStatus, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { transporter, nodemailer, email } from "src/templates/template.mail";
import { printer, docDefinitionFacture } from "src/templates/template.pdf";
import { HttpExceptionFilter  } from 'src/exception/unauthorizedExceptionFilter';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editFileName, resizeImagesAvatar } from 'src/ImageConverter/file.util';
import { RBAcPermissions, RBAcGuard } from 'nestjs-rbac';
var sizeOf = require("image-size");
const fs = require('fs-extra');
var glob = require("glob");

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    // @RBAcPermissions('permission1', 'permission1@create')
    // @UseGuards(AuthGuard('jwt'), RBAcGuard)
    @Get()
    public async getAllUsers(@Request() req) {
        const users = await this.usersService.findAll();
        req.user;
        return {
            code: 4000,
            message: "liste de tous les users",
            value: users
        }; 
    }

    @RBAcPermissions('permission1', 'permission1@create')
    @UseGuards(AuthGuard('jwt'), RBAcGuard)
    @Post('auth/login')
    async login(@Request() req) {
      return req.user;
    }

    @Get('find')
    public async findOneUser(@Body() body) {
        const queryCondition = body;
        const users = await this.usersService.findOne(queryCondition);
        return {
            code: 4000,
            message: "users trouvés",
            value: [users]
        };
    }

    @Get('/:id')
    public async getUser(@Param() param){
        const user = await this.usersService.findById(param.id);
        if (user == null){
            return {
                code: 4010,
                message: "User n'existe pas",
                value: []
            };
        }
        return {
            code: 4000,
            message: "User trouvé",
            value: [user]
        };
    }

    @Get('/recherche/searchUser')
    public async esSearchUser(@Body('search_user') search_user: string){   
        const results = await this.usersService.userSearch(search_user);
        return { 
            code: 4000,
            message: "resultat trouvé",
            value: results
          };
    }

    @Get('/routes/user')
    public async testAuthRoute(){
        return {
            message: 'for user and admin'
        }
    }

    @Get('/routes/admin')
    public async testAuthRoute1(){
        return {
            message: 'admin only'
        }
    }
    
    /*Inscription avec ElasticSearch*/
    // @Post() 
    // // //@UseGuards(AuthGuard('jwt'), RolesGuard)
    // @Roles('user', 'admin')
    // @ApiBearerAuth()
    // @HttpCode(HttpStatus.OK)
    // @ApiOkResponse({})
    // public async create(@Body() createUserDto: CreateUserDto, @Body() body) {
    //     const username = await this.usersService.findOneByUsernameEs(body.username);
    //     const email = await this.usersService.findOneByEmailEs(body.email);
    //     if(username[0] == undefined && email[0] == undefined){
    //         return await this.usersService.create(createUserDto);
    //     } else if (username[0] != undefined){
    //         throw new HttpException('Username existe déjà', HttpStatus.OK);
    //     } else {
    //         throw new HttpException('Email existe déjà', HttpStatus.OK);
    //     }
    // }

    @Post()
    public async create(@Body() createUserDto: CreateUserDto, @Body() body) {
        const { username, email } = createUserDto;
        const usernameFinded = await this.usersService.findOneByUsername({username});
        const emailFinded = await this.usersService.findOneByUsername({email});
        if(usernameFinded == null && emailFinded == null){
            return await this.usersService.create(createUserDto);
        } else if (usernameFinded != null){
            throw new HttpException({
                code: 4003,
                message: "Username existe déjà",
                value: []
              }, HttpStatus.OK);
        } else {
            throw new HttpException({
                code: 4003,
                message: "Email existe déjà",
                value: []
              }, HttpStatus.OK);
        }
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
          destination: (req: Request, file, cb) =>
            cb(null, 'uploads/avatars'),
          filename: editFileName,
        }),
      }),
    )
    public async updateUSer(@UploadedFile() file, @Param() param, @Body() body){
        if (file){
            const [, ext] = file.mimetype.split('/');
            let filename = file.filename;
            let dimensions = sizeOf('uploads/avatars/'+filename);
            if(dimensions.width < 180 && dimensions.height < 240){
                glob(`**uploads/avatars/${file.filename}*`, function(err, files) {
                    if (err) throw err;
                    for (const file of files) {
                        fs.unlink(file);
                    }
                });    
                return {
                    code: '4004',
                    message: 'width inférieur à 180 and height inférieur à 240',
                    value:[{
                        imageBloquee: file.originalname 
                    }]
                };    
            } else {
                resizeImagesAvatar(ext, file);
                fs.unlink('uploads/avatars/'+filename);
                const useravatar = await this.usersService.findById(param.id);
                let avatarDb = useravatar['avatar'];                

                glob(`**uploads/avatars/${avatarDb}*`, function(err, files) {
                  if (err) throw err;
                  for (const file of files) {
                      fs.unlink(file);
                  }
                });
                file['avatar'] = filename.split(".")[0];      
                const user = await this.usersService.update(param.id, file);
                return {
                  code: '4000',
                  message: 'avatar ajouté avec success',
                  value: [
                      user
                  ]
                };      
            }
        } else {
            const user = await this.usersService.update(param.id, body);
            return {
                code: '4000',
                message: 'user modifié avec success',
                value: [
                    user
                ]
              };      
        }
    }      

    @Delete('/:id')
    public async deleteUser(@Param() param, @Res() res) {
        const user = await this.usersService.findById(param.id);
        let avatar = user['avatar'];
        glob(`**uploads/avatars/${avatar}*`, function(err, files) {
            if (err) throw err;
            for (const file of files) {
                fs.unlink(file);
            }
        });
        
        res.send({
            code: 4000,
            message: "User suprrimé",
            value: []
        });
        return this.usersService.delete(param.id);
    }
}
