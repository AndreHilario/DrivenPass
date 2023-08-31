import { IsInt, IsNotEmpty, IsString, IsStrongPassword, IsUrl } from "class-validator";

export class CreateCredentialDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsUrl()
    url: string;

    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsStrongPassword({
        minLength: 6,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
    })
    encryptedPassword: string;

    @IsNotEmpty()
    @IsInt()
    userId: number;
}
