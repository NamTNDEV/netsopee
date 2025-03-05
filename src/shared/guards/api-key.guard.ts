
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import configEnv from '../config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const apiKey = request.headers['x-api-key'];
        if (!apiKey) {
            throw new UnauthorizedException("API Key is required");
        }
        if (apiKey !== configEnv.API_KEY) {
            throw new UnauthorizedException("Invalid API Key");
        }
        return true;
    }
}
