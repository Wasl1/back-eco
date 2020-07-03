import { IsNotEmpty, MinLength, MaxLength, IsString } from 'class-validator';
export class LoginUserDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(5)
    @MaxLength(255)
    readonly username: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(5)
    @MaxLength(1024)
    readonly password: string;
}