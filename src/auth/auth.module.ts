import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from 'src/auth/strategy/jwt-strategy';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersSchema } from 'src/users/schema/users.schema';
import { RefreshTokenSchema } from 'src/auth/schemas/refresh-token.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: 'User', schema: UsersSchema },
    { name: 'RefreshToken', schema: RefreshTokenSchema }
  ]),UsersModule, PassportModule,
    JwtModule.register({
      secretOrPrivateKey: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION }
    })],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
