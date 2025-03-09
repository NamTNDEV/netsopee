import { OTP_TYPE_VALUE } from "src/shared/constants/auth.constants";
import { UserSchema } from "src/shared/models/shared-user.models";
import { z } from "zod";

// Schemas:
export const RegisterBodySchema = UserSchema.pick({
    email: true,
    password: true,
    name: true,
    phoneNumber: true,
}).extend({
    confirmPassword: z.string().min(6).max(100),
    code: z.string().length(6),
}).strict().superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
        ctx.addIssue({
            code: 'custom',
            path: ['confirmPassword'],
            message: 'Password and Confirm Password must be the same',
        });
    }
})

export const RegisterResSchema = UserSchema.omit({
    password: true,
    totpSecret: true,
})

export const VerificationCodeSchema = z.object({
    id: z.number(),
    email: z.string().email(),
    code: z.string().length(6),
    type: z.enum([OTP_TYPE_VALUE.REGISTER, OTP_TYPE_VALUE.FORGOT_PASSWORD]),
    expiresAt: z.date(),
    createdAt: z.date(),
});

export const SendOTPBodySchema = VerificationCodeSchema.pick({
    email: true,
    type: true,
}).strict();

export const LoginBodySchema = UserSchema.pick({
    email: true,
    password: true,
}).strict();

export const LoginResSchema = z.object({
    accessToken: z.string(),
    refreshToken: z.string()
})

export const DeviceSchema = z.object({
    id: z.number(),
    userId: z.number(),
    userAgent: z.string(),
    ip: z.string(),
    lastActive: z.date(),
    createdAt: z.date(),
    isActive: z.boolean(),
})

export const RoleSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string(),
    isActive: z.boolean(),
    createdById: z.number().nullable(),
    updatedById: z.number().nullable(),
    deletedAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export const RefreshTokenSchema = z.object({
    token: z.string(),
    userId: z.number(),
    deviceId: z.number(),
    expiresAt: z.date(),
    createdAt: z.date(),
});

export const RefreshTokenBodySchema = z.object({
    refreshToken: z.string(),
}).strict();

// Types:
export type RegisterBodyType = z.infer<typeof RegisterBodySchema>;
export type VerificationCodeType = z.infer<typeof VerificationCodeSchema>;
export type SendOTPBodyType = z.infer<typeof SendOTPBodySchema>;
export type LoginBodyType = z.infer<typeof LoginBodySchema>;
export type DeviceType = z.infer<typeof DeviceSchema>;
export type RoleType = z.infer<typeof RoleSchema>;
export type RefreshTokenType = z.infer<typeof RefreshTokenSchema>;
export type RefreshTokenBodyType = z.infer<typeof RefreshTokenBodySchema>;
export type LogoutBodyType = RefreshTokenBodyType;



