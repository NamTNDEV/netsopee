export const AUTH_TYPE_VALUE = {
    BEARER: 'Bearer',
    API_KEY: 'ApiKey',
    NONE: 'None'
} as const;

export type AuthType = (typeof AUTH_TYPE_VALUE)[keyof typeof AUTH_TYPE_VALUE];

export const CONDITION_GUARD_VALUE = {
    AND: 'and',
    OR: 'or'
} as const;

export type ConditionGuardType = (typeof CONDITION_GUARD_VALUE)[keyof typeof CONDITION_GUARD_VALUE];

export const UserStatus = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    BLOCKED: 'BLOCKED',
} as const;

export const OTP_TYPE_VALUE = {
    REGISTER: 'REGISTER',
    FORGOT_PASSWORD: 'FORGOT_PASSWORD',
} as const;

export type OtpType = (typeof OTP_TYPE_VALUE)[keyof typeof OTP_TYPE_VALUE];
