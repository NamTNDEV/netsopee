import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import configEnv from "../config";
import { TokenPayloadType } from "../types/jwt.type";

@Injectable()
export class TokenService {
    constructor(private readonly jwtService: JwtService) { };

    signAccessToken(payload: any) {
        return this.jwtService.sign(payload, {
            secret: configEnv.JWT_ACCESS_TOKEN_PRIVATE_KEY,
            expiresIn: configEnv.JWT_ACCESS_TOKEN_EXPIRE,
            algorithm: 'HS256',
        });
    }

    signRefreshToken(payload: any) {
        return this.jwtService.sign(payload, {
            secret: configEnv.JWT_REFRESH_TOKEN_PRIVATE_KEY,
            expiresIn: configEnv.JWT_REFRESH_TOKEN_EXPIRE,
            algorithm: 'HS256',
        });
    }

    verifyAccessToken(token: string): Promise<TokenPayloadType> {
        return this.jwtService.verifyAsync(token, {
            secret: configEnv.JWT_ACCESS_TOKEN_PRIVATE_KEY,
            algorithms: ['HS256'],
        });
    }

    verifyRefreshToken(token: string): Promise<TokenPayloadType> {
        return this.jwtService.verifyAsync(token, {
            secret: configEnv.JWT_REFRESH_TOKEN_PRIVATE_KEY,
            algorithms: ['HS256'],
        });
    }

    async signPairToken(payload: any) {
        const [accessToken, refreshToken] = await Promise.all([
            this.signAccessToken(payload),
            this.signRefreshToken(payload),
        ])
        return {
            accessToken,
            refreshToken
        }
    }
}