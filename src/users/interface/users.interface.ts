export interface Users {
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
    readonly roles: [string];
    readonly avatar: {};
    readonly extension: string;
    readonly verification: string;
}