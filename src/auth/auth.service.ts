import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { LoginUserDto } from 'src/users/dto/login-user.dto';
import { UsersService } from 'src/users/users.service';
import { JwtPayload } from './interface/jwt-payload.interface';
const bcrypt = require('bcrypt');
import { Model } from 'mongoose';
import { Request } from 'express';
import { v4 } from 'uuid';
import { getClientIp } from 'request-ip';
import { RefreshToken } from 'src/auth/interface/refresh-token.interface';
import { RefreshAccessTokenDto } from 'src/users/dto/refresh-access-token.dto';

@Injectable()
export class AuthService {
    constructor(
      @InjectModel('RefreshToken') private readonly refreshTokenModel: Model<RefreshToken>,
      private usersService: UsersService, 
      private jwtService: JwtService
    ){}
    async login(req: Request, loginAttempt: LoginUserDto) {
        const { username } = loginAttempt;
        let userToAttempt = await this.usersService.findOneByUsername({username});
        if (!userToAttempt) {
            throw new HttpException({
              code: 4001,
              message: "Identifiant et mot de passe ne se correspondent pas",
              value: []
            }, HttpStatus.OK);
        }
        await this.checkPassword(loginAttempt.password, userToAttempt);
        await this.passwordsAreMatch(userToAttempt);
        return {
            accessToken: await this.createJwtPayload(userToAttempt),
            refreshToken: await this.createRefreshToken(req, userToAttempt._id)
        };

    }
    async validateUserByJwt(payload: JwtPayload) { 
      const { username } = payload;
        let user = await this.usersService.findOneByUsername({username});
        if(user){
            return this.createJwtPayload(user);
        } else {
            throw new UnauthorizedException();
        }
    }

    async createRefreshToken(req: Request, userId) {
      const refreshToken = new this.refreshTokenModel({
        userId,
        refreshToken: v4(),
        ip: this.getIp(req),
        browser: this.getBrowserInfo(req),
        country: this.getCountry(req),
      });
      await refreshToken.save();
      return refreshToken.refreshToken;
    }

    async refreshAccessToken(req: Request, refreshAccessTokenDto: RefreshAccessTokenDto) {
        const userId = await this.findRefreshToken(refreshAccessTokenDto.refreshToken);
        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new HttpException({
              code: 4003,
              message: "Veuillez vous connecter(session expire)",
              value: []
            }, HttpStatus.OK);
        }
        return {
            accessToken: await this.createJwtPayload(user),
            refreshToken: await this.createRefreshToken(req, user._id),
        };
    }

    async findRefreshToken(token: string) {
        const refreshToken = await this.refreshTokenModel.findOne({refreshToken: token});
        if (!refreshToken) {
          throw new HttpException({
            code: 4003,
            message: "Veuillez vous connecter(session expire)",
            value: []
          }, HttpStatus.OK);
        }
        return refreshToken.userId;
      }
    
    async createJwtPayload(user){
        let data: JwtPayload = {
            username: user.username,
            role: user.role,
        };
        let jwt = this.jwtService.sign(data);
        return {
            role: user.role,
            token: jwt          
        }
    }

    private async checkPassword(attemptPass: string, user) {
        const match = await bcrypt.compare(attemptPass, user.password);
        if (!match) {
          throw new HttpException({
            code: 4001,
            message: "Identifiant et mot de passe ne se correspondent pas",
            value: []
          }, HttpStatus.OK);
        }
        return match;
    }

    private async passwordsAreMatch(user) {
        user.loginAttempts = 0 ;
        await user.save();
    }

    async delete(filter = {}): Promise<any> {
        return this.refreshTokenModel.deleteMany(filter).exec();
    }

    async deleteRefreshToken(userId: string, value: string) {
        await this.delete({ value });
      }
  
      async logout(userId: string, refreshToken: string): Promise<any> {
        await this.deleteRefreshToken(userId, refreshToken);
      }

    getIp(req: Request): string {
      return getClientIp(req);
  }

    getBrowserInfo(req: Request): string {
        return req.header['user-agent'] || 'XX';
    }

    getCountry(req: Request): string {
        return req.header['cf-ipcountry'] ? req.header['cf-ipcountry'] : 'XX';
    }
}
