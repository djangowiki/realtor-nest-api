import { Injectable, ConflictException, NotFoundException, HttpException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserType } from '@prisma/client';
import * as bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken'

interface SignupData {
    name: string;
    phone: string;
    email: string;
    password: string
}

interface SignInData {
    email: string;
    password: string;
}

@Injectable()
export class AuthService {
    constructor(private readonly prismaService: PrismaService) { }
    // for this signup method, we are going to make it async since we
    // we are going to make a lot of ansyc stuff here
    async signup({ email, password, name, phone }: SignupData, userType: UserType) {
        const userExists = await this.prismaService.user.findUnique({
            where: {
                email
            }
        })
        if (userExists) {
            throw new ConflictException
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await this.prismaService.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phone,
                user_type: userType

            }
        })
        // const token = await jwt.sign({ name, id: user.id }, process.env.JWT_SECRET, { expiresIn: 3600000 })
        // return token;
        return this.generateJWT(user.name, user.id)
    }

    async signin({ email, password }: SignInData) {
        // Check for user
        const user = await this.prismaService.user.findUnique({ where: { email } });
        if (!user) {
            throw new HttpException('Invalid Credentials', 400)
        }
        // Validate User Password
        const hashedPassword = user.password
        const isValidPassword = bcrypt.compare(password, hashedPassword)
        if (!isValidPassword) {
            throw new HttpException('Invalid Credentials', 400)
        }
        // Send Token.
        return this.generateJWT(user.name, user.id)
    }

    private generateJWT(name: string, id: number) {
        const token = jwt.sign({ name, id }, process.env.JWT_SECRET, { expiresIn: 360000 })
        return token;
    }
    generateProductkey(email: string, userType: UserType) {
        const string = `${email}-${userType}-${process.env.PRODUCT_KEY_SECRET}`;
        return bcrypt.hash(string, 10);
    }
}
