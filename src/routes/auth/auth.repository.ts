import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/shared/services/prisma.service";
import { RegisterBodyType, VerificationCodeType } from "./auth.model";
import { UserType } from "src/shared/models/shared-user.models";

@Injectable()
export class AuthRepository {
    constructor(private readonly prismaService: PrismaService) { }

    async createUser(
        user: Omit<RegisterBodyType, 'confirmPassword'> & Pick<UserType, 'roleId'>
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
}