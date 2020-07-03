import { Users } from 'src/users/interface/users.interface';
import { Document } from 'mongoose';

export interface RefreshToken extends Document {
    userId: Users;
    refreshToken: string;
    ip: string;
    browser: string;
    country: string;
}
