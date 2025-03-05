
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AUTH_METADATA_KEY, AuthDecoratorPayloadType } from '../decorators/auth.decorator';
import { ApiKeyGuard } from './api-key.guard';
import { AccessTokenGuard } from './access-token.guard';
import { AUTH_TYPE_VALUE, CONDITION_GUARD_VALUE } from '../constants/auth.constant';


@Injectable()
export class AuthenticationGuard implements CanActivate {
    private readonly authTypeGuardMap: Record<string, CanActivate>;

    constructor(
        private readonly reflector: Reflector,
        private readonly apiKeyGuard: ApiKeyGuard,
        private readonly accessTokenGuard: AccessTokenGuard
    ) {
        this.authTypeGuardMap = {
            [AUTH_TYPE_VALUE.API_KEY]: this.apiKeyGuard,
            [AUTH_TYPE_VALUE.BEARER]: this.accessTokenGuard,
            [AUTH_TYPE_VALUE.NONE]: { canActivate: () => true }
        };
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const authTypeValues = this.reflector.getAllAndOverride<AuthDecoratorPayloadType | undefined>(AUTH_METADATA_KEY, [
            context.getHandler(),
            context.getClass(),
        ]) ?? { authType: [AUTH_TYPE_VALUE.NONE], options: { conditionGuard: 'AND' } };
        const guards = authTypeValues.authType.map(authType => this.authTypeGuardMap[authType]);
        let error = new UnauthorizedException();
        if (authTypeValues.options?.conditionGuard === CONDITION_GUARD_VALUE.OR) {
            for (const instanceOfGuard of guards) {
                const canActivate = await Promise.resolve(instanceOfGuard.canActivate(context)).catch(
                    (err) => {
                        error = err;
                        return false;
                    }
                );
                if (canActivate) {
                    return true;
                }
            }
            throw error;
        } else {
            for (const instanceOfGuard of guards) {
                const canActivate = await Promise.resolve(instanceOfGuard.canActivate(context)).catch(
                    (err) => {
                        error = err;
                        return false;
                    }
                );
                if (!canActivate) {
                    throw error;
                }
            }
        }
        return true;
    }
}
