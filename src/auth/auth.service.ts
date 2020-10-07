import { Injectable, UnauthorizedException, BadRequestException, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { LoginUserDto } from 'src/users/dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { Users } from 'src/users/interface/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RefreshToken } from 'src/auth/interfaces/refresh-token.interface';
import { sign } from 'jsonwebtoken';
import { Request } from 'express';
import { v4 } from 'uuid';
import { getClientIp } from 'request-ip';
import * as Cryptr from 'cryptr';
import { RefreshAccessTokenDto } from 'src/users/dto/refresh-access-token.dto';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {

    constructor(@InjectModel('RefreshToken') private readonly refreshTokenModel: Model<RefreshToken>,
    @InjectModel('User') private readonly userModel: Model<Users>,
    private usersService: UsersService){
    }

    async login(req: Request, loginUserDto: LoginUserDto) {
      const { username } = loginUserDto;
      const user = await this.usersService.findOneByUsername({ username });
      if (!user) {
        throw new HttpException({
          code: 4001,
          message: "Identifiant et mot de passe ne se correspondent pas",
          value: []
        }, HttpStatus.OK);
      }
      await this.checkPassword(loginUserDto.password, user);
      await this.passwordsAreMatch(user);
      return {
          accessToken: await this.createAccessToken(user._id),
          refreshToken: await this.createRefreshToken(req, user._id),
      };
    }

    async refreshAccessToken(req: Request, refreshAccessTokenDto: RefreshAccessTokenDto) {
      const userId = await this.findRefreshToken(refreshAccessTokenDto.refreshToken);
      const user = await this.userModel.findById(userId);
      if (!user) {
          throw new HttpException({
            code: 4003,
            message: "Veuillez vous connecter(session expire)",
            value: []
          }, HttpStatus.OK);
      }
      return {
          accessToken: await this.createAccessToken(user._id),
          refreshToken: await this.createRefreshToken(req, user._id),
      };
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

    async createAccessToken(userId: string) {
      const accessToken = sign({userId}, process.env.JWT_SECRET , { expiresIn: process.env.JWT_EXPIRATION });
      return accessToken;
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
    
    async validateUser(jwtPayload: JwtPayload): Promise<any> {
      const user = await this.userModel.findOne({_id: jwtPayload.userId});
      if (!user) {
        throw new HttpException({
          code: 4003,
          message: "Utilisateur introuvable",
          value: []
        }, HttpStatus.OK);
      }
      return user;
    }
    
    async deleteRefreshToken(userId: string, value: string) {
      await this.delete({ value });
    }

    async logout(userId: string, refreshToken: string): Promise<any> {
      await this.deleteRefreshToken(userId, refreshToken);
    }

    async delete(filter = {}): Promise<any> {
      return this.refreshTokenModel.deleteMany(filter).exec();
    }

      // JWT Extractor
    private jwtExtractor(request) {
      let token = null;
      if (request.header('x-token')) {
      token = request.get('x-token');
    } else if (request.headers.authorization) {
        token = request.headers.authorization.replace('Bearer ', '').replace(' ', '');
    } else if (request.body.token) {
        token = request.body.token.replace(' ', '');
    }
        if (request.query.token) {
        token = request.body.token.replace(' ', '');
    }
        const cryptr = new Cryptr(process.env.CLE_CRYPTR);
        if (token) {
        try {
            token = cryptr.decrypt(token);
        } catch (err) {
            throw new BadRequestException('Bad request.');
        }
    }
        return token;
    }

    // Methods
    returnJwtExtractor() {
        return this.jwtExtractor;
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
