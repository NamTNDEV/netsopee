import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/shared/services/prisma.service";
import { RegisterBodyType, VerificationCodeType } from "./auth.model";
import { UserType } from "src/shared/models/shared-user.models";
import { OtpType } from "src/shared/constants/auth.constants";
import { VerificationCode } from "@prisma/client";

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
}