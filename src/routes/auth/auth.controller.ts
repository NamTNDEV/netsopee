import { Body, Controller, HttpCode, HttpStatus, Ip, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginBodyDto, LoginResDto, LogoutBodyDto, LogoutResDto, RefreshTokenBodyDto, RefreshTokenResDto, RegisterBodyDto, RegisterResDto, SendOtpBodyDto, SendOtpResDto } from './auth.dto';
import { ZodSerializerDto } from 'nestjs-zod';
import { UserAgent } from 'src/shared/decorators/user-agent.decorator';
import { IsPublic } from 'src/shared/decorators/auth.decorator';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @IsPublic()
    @Post('register')
    @ZodSerializerDto(RegisterResDto)
    async register(@Body() body: RegisterBodyDto) {
        return await this.authService.register(body);
    };

    @IsPublic()
    @Post('send-otp')
    @HttpCode(HttpStatus.OK)
    @ZodSerializerDto(SendOtpResDto)
    async sendOtp(@Body() body: SendOtpBodyDto) {
        return await this.authService.sendOTP(body);
    };

    @IsPublic()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ZodSerializerDto(LoginResDto)
    async login(@Body() body: LoginBodyDto, @UserAgent() userAgent: string, @Ip() ip: string) {
        return await this.authService.login({
            ...body,
            userAgent,
            ip,
        });
    };

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @ZodSerializerDto(LogoutResDto)
    async logout(@Body() body: LogoutBodyDto) {
        return await this.authService.logout(body);
    }

    @IsPublic()
    @Post('refresh-token')
    @HttpCode(HttpStatus.OK)
    @ZodSerializerDto(RefreshTokenResDto)
    async refreshToken(@Body() body: RefreshTokenBodyDto, @UserAgent() userAgent: string, @Ip() ip: string) {
        return this.authService.refreshToken({
            ...body,
            userAgent,
            ip,
        });
    }
}
