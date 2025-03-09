import { SetMetadata } from "@nestjs/common";
import { AUTH_TYPE_VALUE, AuthType, CONDITION_GUARD_VALUE, ConditionGuardType } from "../constants/auth.constants";
export const AUTH_METADATA_KEY = 'auth_metadata_key';
export interface AuthDecoratorPayloadType {
    authType: AuthType[];
    options?: {
        conditionGuard: ConditionGuardType;
    }
};
export const Auth = (authType: AuthType[], options?: { conditionGuard: ConditionGuardType }) => {
    return SetMetadata(AUTH_METADATA_KEY,
        {
            authType,
            options: options ?? { conditionGuard: CONDITION_GUARD_VALUE.AND }
        });
}

export const IsPublic = () => Auth([AUTH_TYPE_VALUE.NONE]);