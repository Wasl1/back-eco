import { Body, Controller, Get, Post, UseGuards, ValidationPipe, HttpCode, HttpStatus, Req } from '@nestjs/common';
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
        return await this.authService.login(req, loginUserDto);
    }

    @Post('refreshAccessToken')
    @HttpCode(HttpStatus.CREATED)
    @ApiCreatedResponse({})
    async refreshAccessToken(@Body() refreshAccessTokenDto: RefreshAccessTokenDto) {
        return await this.authService.refreshAccessToken(refreshAccessTokenDto);
    }

    @Post('deleteRefreshToken')
    @HttpCode(HttpStatus.CREATED)
    @ApiCreatedResponse({})
    async logout(@Body() refreshToken: string, userId: string) {
        return await this.authService.logout(refreshToken,userId);
    }

}
