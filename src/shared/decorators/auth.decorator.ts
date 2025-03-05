import { SetMetadata } from "@nestjs/common";
import { AuthType, CONDITION_GUARD_VALUE, ConditionGuardType } from "../constants/auth.constant";
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