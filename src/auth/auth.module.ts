import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersSchema } from 'src/users/schema/users.schema';
import { RefreshTokenSchema } from 'src/auth/schemas/refresh-token.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UsersSchema },
      { name: 'RefreshToken', schema: RefreshTokenSchema },
    ]),
    PassportModule,
    JwtModule.register({
      secretOrPrivateKey: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION }
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
