import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import configEnv from "../config";
import { AccessTokenPayloadDecoded, AccessTokenPayloadInput, RefreshTokenPayloadDecoded, RefreshTokenPayloadInput } from "../types/jwt.type";
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TokenService {
    constructor(private readonly jwtService: JwtService) { };

    signAccessToken(payload: AccessTokenPayloadInput) {
        return this.jwtService.sign({ ...payload, uuid: uuidv4() }, {
            secret: configEnv.JWT_ACCESS_TOKEN_PRIVATE_KEY,
            expiresIn: configEnv.JWT_ACCESS_TOKEN_EXPIRE,
            algorithm: 'HS256',
        });
    }

    signRefreshToken(payload: RefreshTokenPayloadInput) {
        return this.jwtService.sign({ ...payload, uuid: uuidv4() }, {
            secret: configEnv.JWT_REFRESH_TOKEN_PRIVATE_KEY,
            expiresIn: configEnv.JWT_REFRESH_TOKEN_EXPIRE,
            algorithm: 'HS256',
        });
    }

    verifyAccessToken(token: string): Promise<AccessTokenPayloadDecoded> {
        return this.jwtService.verifyAsync(token, {
            secret: configEnv.JWT_ACCESS_TOKEN_PRIVATE_KEY,
            algorithms: ['HS256'],
        });
    }

    verifyRefreshToken(token: string): Promise<RefreshTokenPayloadDecoded> {
        return this.jwtService.verifyAsync(token, {
            secret: configEnv.JWT_REFRESH_TOKEN_PRIVATE_KEY,
            algorithms: ['HS256'],
        });
    }

    async signPairToken(payload: any) {
        const [accessToken, refreshToken] = await Promise.all([
            this.signAccessToken({
                userId: payload.userId,
                deviceId: payload.deviceId,
                roleId: payload.roleId,
                roleName: payload.roleName,
            }),
            this.signRefreshToken({
                userId: payload.userId
            }),
        ])
        return {
            accessToken,
            refreshToken
        }
    }
}