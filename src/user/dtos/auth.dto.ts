import { UserType } from "@prisma/client";
import { IsString, IsNotEmpty, IsEmail, MinLength, Matches, IsEnum, IsOptional } from "class-validator";
export class SignUpDto {
    @IsString()
    @IsNotEmpty()
    name: string;
    @Matches(/^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/, { message: "Phone must be a valid phone number" })
    phone: string;
    @IsEmail()
    email: string;
    @IsString()
    @MinLength(5)
    password: string;
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    productKey?: string;
}

export class SignInDto {
    @IsEmail()
    email: string;
    @IsString()
    password: string;
}

export class ProductKeyDto {
    @IsEmail()
    email: string;
    @IsEnum(UserType)
    userType: UserType
}