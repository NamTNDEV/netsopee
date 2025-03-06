import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import { RoleService } from './role.service';
import { HashService } from 'src/shared/services/hash.service';
import { isNotFoundPrismaError, usUniqueConstraintPrismaError } from 'src/shared/helpers';
import { TokenService } from 'src/shared/services/token.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly roleService: RoleService,
        private readonly tokenService: TokenService,
        private readonly hashService: HashService
    ) { }

    async generateTokenPair(userId: number) {
        try {
            const tokenPair = await this.tokenService.signPairToken({ userId });
            const decodedRefreshToken = await this.tokenService.verifyRefreshToken(tokenPair.refreshToken);
            await this.prismaService.refreshToken.create({
                data: {
                    userId: userId,
                    token: tokenPair.refreshToken,
                    expiresAt: new Date(decodedRefreshToken.exp * 1000)
                }
            });
            return tokenPair;
        } catch (error) {
            throw error;
        }
    }

    async register(body: any) {
        try {
            const hashedPassword = this.hashService.hash(body.password);
            const clientRole = await this.roleService.getClientRoleId();
            const newUser = await this.prismaService.user.create({
                data: {
                    email: body.email,
                    password: hashedPassword,
                    roleId: clientRole,
                    name: body.name,
                    phoneNumber: body.phoneNumber
                }
            });

            return newUser;
        } catch (error) {
            if (usUniqueConstraintPrismaError(error)) {
                throw new ConflictException('Email already exists');
            }

            throw error;
        }
    }

    async login(body: any) {
        const user = await this.prismaService.user.findUnique({
            where: {
                email: body.email
            }
        })

        if (!user) {
            throw new UnauthorizedException('Email or password is incorrect');
        }

        const isPasswordValid = this.hashService.compare(body.password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Email or password is incorrect');
        }

        const tokenPair = await this.generateTokenPair(user.id);
        return tokenPair;
    }

    async logout(body: any) {
        try {
            await this.tokenService.verifyRefreshToken(body.refreshToken);
            await this.prismaService.refreshToken.delete({
                where: {
                    token: body.refreshToken
                }
            });

            return {
                message: 'Logout successful'
            }
        } catch (error) {
            if (isNotFoundPrismaError(error)) {
                throw new UnauthorizedException('Refresh token has been revoked');
            }
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async refreshToken(body: any) {
        try {
            const decodedRefreshToken = await this.tokenService.verifyRefreshToken(body.refreshToken);
            await this.prismaService.refreshToken.findUniqueOrThrow({
                where: {
                    token: body.refreshToken
                }
            });
            await this.prismaService.refreshToken.delete({
                where: {
                    token: body.refreshToken
                }
            });
            const tokenPair = await this.generateTokenPair(decodedRefreshToken.userId);
            return tokenPair;
        } catch (error) {
            if (isNotFoundPrismaError(error)) {
                throw new UnauthorizedException('Refresh token has been revoked');
            }
            throw new UnauthorizedException('Invalid refresh token');
        }
    }
}
