import { HttpException, Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { HashService } from 'src/shared/services/hash.service';
import { generateVerificationCode, isNotFoundPrismaError, usUniqueConstraintPrismaError } from 'src/shared/helpers';
import { TokenService } from 'src/shared/services/token.service';
import { ForgotPasswordBodyType, LoginBodyType, LogoutBodyType, RefreshTokenBodyType, RegisterBodyType, SendOTPBodyType } from '../auth.model';
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repositories';
import { VerificationCodeType } from '@prisma/client';
import { addMilliseconds } from 'date-fns';
import ms from 'ms';
import configEnv from 'src/shared/config';
import { EmailService } from 'src/shared/services/email.service';
import { RoleService } from './role.service';
import { AuthRepository } from '../auth.repository';
import { EmailAlreadyExistsException, EmailNotFoundException, FailedToSendOTPException, InvalidOTPException, InvalidPasswordException, OTPExpiredException, RefreshTokenAlreadyUsedException, UnauthorizedAccessException } from '../models/errors.model';
import { OTP_TYPE_VALUE } from 'src/shared/constants/auth.constants';


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
            await this.verifyOTP({
                email: body.email,
                code: body.code,
                otpType: VerificationCodeType.REGISTER
            });

            const hashedPassword = this.hashService.hash(body.password);
            const clientRole = await this.roleService.getClientRoleId();
            const [newUser] = await Promise.all([
                this.authRepository.createUser({
                    email: body.email,
                    name: body.name,
                    phoneNumber: body.phoneNumber,
                    roleId: clientRole,
                    password: hashedPassword
                }),
                this.authRepository.deleteVerificationCode({
                    email: body.email,
                    code: body.code,
                    type: VerificationCodeType.REGISTER
                })
            ])

            return newUser;
        } catch (error) {
            if (usUniqueConstraintPrismaError(error)) {
                throw EmailAlreadyExistsException;
            }
            throw error;
        }
    }

    async sendOTP(body: SendOTPBodyType) {
        const user = await this.sharedUserRepository.findUser({ email: body.email });
        if (body.type === OTP_TYPE_VALUE.REGISTER && user) {
            throw EmailAlreadyExistsException;
        }
        if (body.type === OTP_TYPE_VALUE.FORGOT_PASSWORD && !user) {
            throw EmailNotFoundException
        }
        const otpCode = generateVerificationCode();
        await this.authRepository.saveVerificationCode({
            email: body.email,
            code: String(otpCode),
            type: body.type,
            expiresAt: addMilliseconds(new Date(), ms(configEnv.OTP_EXPIRE))
        });

        //Send email
        const { error } = await this.emailService.sendEmail({
            content: otpCode + '',
            email: body.email,
            subject: 'OTP Code'
        });
        console.log("Send email error::: ", error);
        if (error) {
            throw FailedToSendOTPException;
        }

        return { message: "OTP code has been sent to your email, please check your email" };
    }

    async login(body: LoginBodyType & { userAgent: string, ip: string }) {
        const user = await this.authRepository.findUserWithRole({ email: body.email });

        if (!user) {
            throw EmailNotFoundException;
        }

        const isPasswordValid = this.hashService.compare(body.password, user.password);

        if (!isPasswordValid) {
            throw InvalidPasswordException;
        }

        const deviceResult = await this.authRepository.createDevice({
            ip: body.ip,
            userAgent: body.userAgent,
            userId: user.id
        });

        const tokenPair = await this.generateTokenPair({
            userId: user.id,
            roleId: user.roleId,
            roleName: user.role.name,
            deviceId: deviceResult.id
        });
        return tokenPair;
    }

    async logout(body: LogoutBodyType) {
        try {
            await this.tokenService.verifyRefreshToken(body.refreshToken);

            const deleteRefreshToken = await this.authRepository.deleteRefreshToken(body.refreshToken);

            await this.authRepository.updateDevice(deleteRefreshToken.deviceId, {
                isActive: false,
                lastActive: new Date()
            });

            return {
                message: 'Logout successful'
            }
        } catch (error) {
            if (isNotFoundPrismaError(error)) {
                throw RefreshTokenAlreadyUsedException;
            }
            throw UnauthorizedAccessException;
        }
    }

    async refreshToken(body: RefreshTokenBodyType & { userAgent: string, ip: string }) {
        try {
            const { userId } = await this.tokenService.verifyRefreshToken(body.refreshToken);
            const refreshTokenResult = await this.authRepository.findRefreshTokeWithUserAndRole(body.refreshToken);

            if (!refreshTokenResult) {
                throw RefreshTokenAlreadyUsedException;
            }

            const $updatedDevice = this.authRepository.updateDevice(refreshTokenResult.deviceId, {
                ip: body.ip,
                userAgent: body.userAgent
            });

            const $deleteRefreshToken = this.authRepository.deleteRefreshToken(body.refreshToken);

            const $tokenPair = this.generateTokenPair({
                userId: userId,
                roleId: refreshTokenResult.user.roleId,
                roleName: refreshTokenResult.user.role.name,
                deviceId: refreshTokenResult.deviceId
            });

            const [, , tokenPair] = await Promise.all([$updatedDevice, $deleteRefreshToken, $tokenPair]);

            return tokenPair;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw UnauthorizedAccessException;
        }
    }

    async forgotPassword(body: ForgotPasswordBodyType) {
        const { email, code, newPassword } = body;
        const user = await this.sharedUserRepository.findUser({ email });
        if (!user) {
            throw EmailNotFoundException;
        }
        await this.verifyOTP({
            email,
            code,
            otpType: VerificationCodeType.FORGOT_PASSWORD
        });
        const hashedPassword = this.hashService.hash(newPassword);
        await Promise.all([
            await this.authRepository.updateUser({ id: user.id }, { password: hashedPassword }),
            await this.authRepository.deleteVerificationCode({ email, code, type: VerificationCodeType.FORGOT_PASSWORD })
        ]);
        return { message: 'Password has been changed successfully' };
    }

    async verifyOTP({ email, code, otpType }: { email: string, code: string, otpType: VerificationCodeType }) {
        const verificationCode = await this.authRepository.findVerificationCode({
            email,
            code,
            type: otpType
        });

        if (!verificationCode) {
            throw InvalidOTPException;
        }

        if (verificationCode.expiresAt < new Date()) {
            throw OTPExpiredException;
        }

        return verificationCode;
    }
}
