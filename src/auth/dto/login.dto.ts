import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class LoginDto {

    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(1)
    password: string;

}
