import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/shared/services/prisma.service";
import { DeviceType, RefreshTokenType, RegisterBodyType, RoleType, VerificationCodeType } from "./auth.model";
import { UserType } from "src/shared/models/shared-user.models";
import { OtpType } from "src/shared/constants/auth.constants";
import { RefreshToken, VerificationCode } from "@prisma/client";

@Injectable()
export class AuthRepository {
    constructor(private readonly prismaService: PrismaService) { }

    async createUser(
        user: Omit<RegisterBodyType, 'confirmPassword' | 'code'> & Pick<UserType, 'roleId'>
    ): Promise<Omit<UserType, 'password' | 'totpSecret'>> {
        return await this.prismaService.user.create({
            data: user,
            omit: {
                password: true,
                totpSecret: true,
            }
        });
    }

    async findUserWithRole(uniqueObject: { email: string } | { id: number }): Promise<UserType & { role: RoleType } | null> {
        return await this.prismaService.user.findUnique({
            where: uniqueObject,
            include: {
                role: true
            }
        });
    }

    async saveVerificationCode(payload: Pick<VerificationCodeType, 'code' | 'email' | 'type' | 'expiresAt'>) {
        return await this.prismaService.verificationCode.upsert({
            where: {
                email: payload.email,
            },
            create: payload,
            update: {
                code: payload.code,
                expiresAt: payload.expiresAt,
            },
        });
    }

    async findVerificationCode(uniqueObject: { id: number } | { email: string, code: string, type: OtpType }):
        Promise<VerificationCode | null> {
        return await this.prismaService.verificationCode.findUnique({
            where: uniqueObject,
        });
    }

    async createDevice(data: Pick<DeviceType, 'userId' | 'userAgent' | 'ip'> & Partial<Pick<DeviceType, 'lastActive' | 'isActive'>>) {
        return await this.prismaService.device.create({
            data
        });
    }

    async updateDevice(id: number, data: Partial<DeviceType>): Promise<DeviceType> {
        return await this.prismaService.device.update({
            where: {
                id
            },
            data
        });
    }

    async createRefreshToken(data:
        Omit<RefreshTokenType, 'createdAt'>
        // { userId: number, token: string, expiresAt: Date, deviceId: number }
    ) {
        return await this.prismaService.refreshToken.create({
            data
        });
    }

    async findRefreshTokeWithUserAndRole(token: string): Promise<RefreshTokenType & { user: UserType & { role: RoleType } } | null> {
        return await this.prismaService.refreshToken.findUnique({
            where: {
                token
            },
            include: {
                user: {
                    include: {
                        role: true
                    }
                }
            }
        });
    }

    async deleteRefreshToken(token: string): Promise<RefreshToken> {
        return await this.prismaService.refreshToken.delete({
            where: {
                token
            }
        });
    }
}
