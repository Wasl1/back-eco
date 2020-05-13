import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { LoginUserDto } from 'src/users/dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService, private jwtService: JwtService){

    }

    async validateUserByPassword(loginAttempt: LoginUserDto) {
        // This will be used for the initial login
        let userToAttempt = await this.usersService.findOneByUsername(loginAttempt.username);
        
        return new Promise((resolve) => {
            // Check the supplied password against the hash stored for this username address
            userToAttempt.checkPassword(loginAttempt.password, (err, isMatch) => {
                if(err) throw new UnauthorizedException();
    
                if(isMatch){
                    // If there is a successful match, generate a JWT for the user
                    resolve(this.createJwtPayload(userToAttempt));
    
                } else {
                    throw new UnauthorizedException();
                }
            });
        });
    }

    async validateUserByJwt(payload: JwtPayload) { 

        // This will be used when the user has already logged in and has a JWT
        let user = await this.usersService.findOneByUsername(payload.username);

        if(user){
            return this.createJwtPayload(user);
        } else {
            throw new UnauthorizedException();
        }
    }

    createJwtPayload(user){
        let data: JwtPayload = {
            username: user.username
        };

        let jwt = this.jwtService.sign(data);

        return {
            expiresIn: 3600,
            token: jwt            
        }
    }
}
