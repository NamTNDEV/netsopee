import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    async register(@Body() body: any) {
        return await this.authService.register(body);
    };

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() body: any) {
        return await this.authService.login(body);
    };

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@Body() body: any) {
        return await this.authService.logout(body);
    }

    @Post('refresh-token')
    @HttpCode(HttpStatus.OK)
    async refreshToken(@Body() body: any) {
        return this.authService.refreshToken(body);
    }
}
