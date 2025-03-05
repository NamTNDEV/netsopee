
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { TokenService } from '../services/token.service';
import { REQUEST_CONSTANTS } from '../constants/request.constant';

@Injectable()
export class AccessTokenGuard implements CanActivate {
    constructor(private readonly tokenService: TokenService) { }
    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const accessToken = request.headers['authorization'] ? request.headers['authorization'].split(' ')[1] : null;
        if (!accessToken) {
            // return false;
            throw new UnauthorizedException("Access token is required");
        }
        try {
            const decodedAccessToken = await this.tokenService.verifyAccessToken(accessToken);
            request[REQUEST_CONSTANTS.DECODED_ACCESS_TOKEN_KEY] = decodedAccessToken;
        } catch (error) {
            console.error("🔴 Error in AuthGuard", error);
            // return false;
            throw new UnauthorizedException("Invalid Access Token");
        }
        return true;
    }
}
