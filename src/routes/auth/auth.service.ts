import { ConflictException, Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { RoleService } from './role.service';
import { HashService } from 'src/shared/services/hash.service';
import { generateVerificationCode, isNotFoundPrismaError, usUniqueConstraintPrismaError } from 'src/shared/helpers';
import { TokenService } from 'src/shared/services/token.service';
import { LoginBodyType, RegisterBodyType, SendOTPBodyType } from './auth.model';
import { AuthRepository } from './auth.repository';
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repositories';
import { VerificationCodeType } from '@prisma/client';
import { addMilliseconds } from 'date-fns';
import ms from 'ms';
import configEnv from 'src/shared/config';
import { EmailService } from 'src/shared/services/email.service';


@Injectable()
export class AuthService {
    constructor(
        private readonly roleService: RoleService,
        private readonly tokenService: TokenService,
        private readonly hashService: HashService,
        private readonly authRepository: AuthRepository,
        private readonly sharedUserRepository: SharedUserRepository,
        private readonly emailService: EmailService
    ) { }

    async generateTokenPair(payload: {
        userId: number;
        roleId: number;
        roleName: string;
        deviceId: number;
    }) {
        try {
            const tokenPair = await this.tokenService.signPairToken({
                userId: payload.userId,
                roleId: payload.roleId,
                roleName: payload.roleName,
                deviceId: payload.deviceId
            });
            const decodedRefreshToken = await this.tokenService.verifyRefreshToken(tokenPair.refreshToken);
            await this.authRepository.createRefreshToken({
                userId: decodedRefreshToken.userId,
                token: tokenPair.refreshToken,
                expiresAt: new Date(decodedRefreshToken.exp * 1000),
                deviceId: payload.deviceId
            });
            return tokenPair;
        } catch (error) {
            throw error;
        }
    }

    async register(body: RegisterBodyType) {
        try {
            //Kiểm tra otp code hợp lệ ? 
            const verificationCode = await this.authRepository.findVerificationCode({
                email: body.email,
                code: body.code,
                type: VerificationCodeType.REGISTER
            });

            if (!verificationCode) {
                throw new UnprocessableEntityException([
                    {
                        message: 'Invalid verification code',
                        path: 'code',
                    }
                ]);
            }

            //Kiểm tra otp code hết hạn ?
            if (verificationCode.expiresAt < new Date()) {
                throw new UnprocessableEntityException([
                    {
                        message: 'Verification code has expired',
                        path: 'code',
                    }])
            }

            const hashedPassword = this.hashService.hash(body.password);
            const clientRole = await this.roleService.getClientRoleId();
            const newUser = await this.authRepository.createUser({
                email: body.email,
                name: body.name,
                phoneNumber: body.phoneNumber,
                roleId: clientRole,
                password: hashedPassword
            });

            return newUser;
        } catch (error) {
            if (usUniqueConstraintPrismaError(error)) {
                throw new UnprocessableEntityException([
                    {
                        message: 'Email already exists',
                        path: 'email',
                    }
                ]);
            }
            throw error;
        }
    }

    async sendOTP(body: SendOTPBodyType) {
        const user = await this.sharedUserRepository.findUser({ email: body.email });
        if (user) {
            throw new UnprocessableEntityException([
                {
                    path: 'email',
                    message: 'Email has been registered'
                }
            ]);
        }
        const otpCode = generateVerificationCode();
        await this.authRepository.saveVerificationCode({
            email: body.email,
            code: String(otpCode),
            type: VerificationCodeType.REGISTER,
            expiresAt: addMilliseconds(new Date(), ms(configEnv.OTP_EXPIRE))
        });

        //Send email
        await this.emailService.sendEmail({
            content: otpCode + '',
            email: body.email,
            subject: 'OTP Code'
        });

        return { message: "OTP code has been sent to your email, please check your email" };
    }

    async login(body: LoginBodyType & { userAgent: string, ip: string }) {
        const user = await this.authRepository.findUserWithRole({ email: body.email });

        if (!user) {
            throw new UnauthorizedException('Email or password is incorrect');
        }

        const isPasswordValid = this.hashService.compare(body.password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Email or password is incorrect');
        }

        const newDevice = await this.authRepository.createDevice({
            ip: body.ip,
            userAgent: body.userAgent,
            userId: user.id
        });

        const tokenPair = await this.generateTokenPair({
            userId: user.id,
            roleId: user.roleId,
            roleName: user.role.name,
            deviceId: newDevice.id
        });
        return tokenPair;
    }

    // async logout(body: any) {
    //     try {
    //         await this.tokenService.verifyRefreshToken(body.refreshToken);
    //         await this.prismaService.refreshToken.delete({
    //             where: {
    //                 token: body.refreshToken
    //             }
    //         });

    //         return {
    //             message: 'Logout successful'
    //         }
    //     } catch (error) {
    //         if (isNotFoundPrismaError(error)) {
    //             throw new UnauthorizedException('Refresh token has been revoked');
    //         }
    //         throw new UnauthorizedException('Invalid refresh token');
    //     }
    // }

    // async refreshToken(body: any) {
    //     try {
    //         const decodedRefreshToken = await this.tokenService.verifyRefreshToken(body.refreshToken);
    //         await this.prismaService.refreshToken.findUniqueOrThrow({
    //             where: {
    //                 token: body.refreshToken
    //             }
    //         });
    //         await this.prismaService.refreshToken.delete({
    //             where: {
    //                 token: body.refreshToken
    //             }
    //         });
    //         const tokenPair = await this.generateTokenPair(decodedRefreshToken.userId);
    //         return tokenPair;
    //     } catch (error) {
    //         if (isNotFoundPrismaError(error)) {
    //             throw new UnauthorizedException('Refresh token has been revoked');
    //         }
    //         throw new UnauthorizedException('Invalid refresh token');
    //     }
    // }
}
