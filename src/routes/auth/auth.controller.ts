import { Body, Controller, Get, HttpCode, HttpStatus, Ip, Post, Query, Res } from '@nestjs/common';
import { ForgotPasswordBodyDto, ForgotPasswordResDto, GoogleGetUrlResDto, LoginBodyDto, LoginResDto, LogoutBodyDto, LogoutResDto, RefreshTokenBodyDto, RefreshTokenResDto, RegisterBodyDto, RegisterResDto, SendOtpBodyDto, SendOtpResDto } from './auth.dto';
import { ZodSerializerDto } from 'nestjs-zod';
import { UserAgent } from 'src/shared/decorators/user-agent.decorator';
import { IsPublic } from 'src/shared/decorators/auth.decorator';
import { AuthService } from './services/auth.service';
import { GoogleService } from './services/google.service';
import { Response } from 'express';
import configEnv from 'src/shared/config';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly googleService: GoogleService
    ) { }

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

    @IsPublic()
    @Get('google/url')
    @HttpCode(HttpStatus.OK)
    @ZodSerializerDto(GoogleGetUrlResDto)
    async getGoogleUrl(@UserAgent() userAgent: string, @Ip() ip: string) {
        return await this.googleService.getGoogleUrl({ userAgent, ip });
    }

    @IsPublic()
    @Get('google/callback')
    async googleCallback(@Query('code') code: string, @Query('state') state: string, @Res() res: Response) {
        try {
            const data = await this.googleService.googleLogin({
                code,
                stateString: state,
            })
            return res.redirect(
                `${configEnv.GOOGLE_CLIENT_REDIRECT_URI}?accessToken=${data.accessToken}&refreshToken=${data.refreshToken}`,
            )
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Đã xảy ra lỗi khi đăng nhập bằng Google, vui lòng thử lại bằng cách khác'
            return res.redirect(`${configEnv.GOOGLE_CLIENT_REDIRECT_URI}?errorMessage=${message}`)
        }
    }

    @IsPublic()
    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    @ZodSerializerDto(ForgotPasswordResDto)
    async forgotPassword(@Body() body: ForgotPasswordBodyDto) {
        return await this.authService.forgotPassword(body);
    }
}
