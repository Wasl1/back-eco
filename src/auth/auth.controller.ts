import { Body, Controller, Get, Post, UseGuards, ValidationPipe, HttpCode, HttpStatus, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from 'src/users/dto/login-user.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation} from '@nestjs/swagger';
import { RefreshAccessTokenDto } from 'src/users/dto/refresh-access-token.dto';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({summary: 'Login User',})
    @ApiOkResponse({})
    async login(@Req() req: Request, @Body() loginUserDto: LoginUserDto) {
        const login = await this.authService.login(req, loginUserDto);
        return {
            code: 4000,
            message: "vous êtes maintenant connecté",
            value: [ login ]
        }
    }

    @Post('refreshAccessToken')
    @HttpCode(HttpStatus.CREATED)
    @ApiCreatedResponse({})
    async refreshAccessToken(@Req() req: Request, @Body() refreshAccessTokenDto: RefreshAccessTokenDto) {
        const refreshToken = await this.authService.refreshAccessToken(req, refreshAccessTokenDto);
        await this.authService.delete(refreshAccessTokenDto);
        return {
            code: 4000,
            message: "token actualisé avec success",
            valeu: [ refreshToken ]
        }
    }

    @Post('deleteRefreshToken')
    @HttpCode(HttpStatus.CREATED)
    @ApiCreatedResponse({})
    async logout(@Body() refreshToken: string, userId: string, @Res() res){
        const deleteRefreshToken = await this.authService.logout(refreshToken,userId);
        res.send({
            code: 4000,
            message: "refreshToken supprimé",
            value: []
        });
        return deleteRefreshToken;
    }

}
