export interface Users {
    readonly email: string;
    readonly username: string;
    readonly password: string;
    readonly refreshToken: string,
    readonly nom: string;
    readonly prenom: string;
    readonly adresse: string;
    readonly tel: string;
    readonly roles: [string];
    readonly avatar: string;
    readonly verification: string;
}