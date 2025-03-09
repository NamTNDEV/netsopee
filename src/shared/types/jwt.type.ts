export interface AccessTokenPayloadInput {
    userId: number;
    deviceId: number;
    roleId: number;
    roleName: string;
}

export interface AccessTokenPayloadDecoded extends AccessTokenPayloadInput {
    exp: number;
    iat: number;
}

export interface RefreshTokenPayloadInput {
    userId: number;
}

export interface RefreshTokenPayloadDecoded extends RefreshTokenPayloadInput {
    exp: number;
    iat: number;
}