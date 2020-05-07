export class CreateUserDto {
    readonly email: string;
    readonly username: string;
    readonly password: string;
    readonly nom: string;
    readonly prenom: string;
    readonly adresse: string;
    readonly tel: string;
    readonly role: string;
    readonly avatar: string;
}