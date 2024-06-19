import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreateUserDto {

    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(1)
    password: string;

    @IsString()
    @MinLength(1)
    fullName: string;

    @IsNotEmpty()
    isActive: boolean;
}
