import { Body, Controller, Param, Post, ParseEnumPipe, UnauthorizedException } from '@nestjs/common';
import { UserType } from '@prisma/client';
import { SignUpDto, SignInDto, ProductKeyDto } from '../dtos/auth.dto';
import { AuthService } from './auth.service';
import * as bcrypt from 'bcryptjs'

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }
    @Post('signup/:userType')
    async signup(@Body() body: SignUpDto, @Param('userType', new ParseEnumPipe(UserType)) userType: UserType) {
        // Make sure the user is a realtor.
        if (userType !== UserType.BUYER) {
            if (!body.productKey) {
                throw new UnauthorizedException()
            }
        }
        // Check if the realtor has a valid product key.
        // Generate the product key we already generated for the user
        const validProductKey = `${body.email}-${userType}-${process.env.PRODUCT_KEY_SECRET}`;
        // Compare our generated product key and the productkey the admin generated for the user.
        const isValidProductKey = await bcrypt.compare(validProductKey, body.productKey);
        if (!isValidProductKey) {
            throw new UnauthorizedException()
        }
        // we are passing in the body because the body has all that information
        return this.authService.signup(body, userType)
    }

    @Post('signin')
    signin(@Body() body: SignInDto) {
        return this.authService.signin(body)
    }

    @Post('key')
    generateProductKey(@Body() { email, userType }: ProductKeyDto) {
        return this.authService.generateProductkey(email, userType)
    }
}
