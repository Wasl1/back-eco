import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from "@nestjs/passport";
import { AuthService } from "../auth.service";
import { JwtPayload } from "../interfaces/jwt-payload.interface";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService){

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET
        });
    }

    async validate(payload: JwtPayload){
        const user = await this.authService.validateUser(payload);
        if(!user){
            throw new HttpException({
                code: 4003,
                message: "Utilisateur introuvable",
                value: []
              }, HttpStatus.OK);
        }
        return user;
    }
}