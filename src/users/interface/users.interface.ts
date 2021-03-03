import { ObjectID } from 'bson';

export interface Users {
    readonly _id: ObjectID;
    readonly email: string;
    readonly username: string;
    readonly password: string;
    readonly refreshToken: string,
    readonly nom: string;
    readonly prenom: string;
    readonly sexe: string;
    readonly adresse: string;
    readonly ville: string;
    readonly pays: string;
    readonly codePostal: string;
    readonly tel: string;
    readonly role: string;
    readonly avatar: {};
    readonly verification: string;
}