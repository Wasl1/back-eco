import { Document } from 'mongoose';

type Access = {
    action : string[]
}

export interface PermissionInterface extends Document {
    readonly name: string;
    readonly accesses : Access[];
}