import { UserStatus, VERIFICATION_CODE_TYPE } from "src/shared/constants/auth.constants";
import { UserSchema } from "src/shared/models/shared-user.models";
import { z } from "zod";

export const RegisterBodySchema = UserSchema.pick({
    email: true,
    password: true,
    name: true,
    phoneNumber: true,
})
    .extend({
        confirmPassword: z.string().min(6).max(100),
    })
    .strict()
    .superRefine(({ password, confirmPassword }, ctx) => {
        if (password !== confirmPassword) {
            ctx.addIssue({
                code: 'custom',
                path: ['confirmPassword'],
                message: 'Password and Confirm Password must be the same',
            });
        }
    })

export type RegisterBodyType = z.infer<typeof RegisterBodySchema>;

export const RegisterResSchema = UserSchema.omit({
    password: true,
    totpSecret: true,
})

export type UserResType = z.infer<typeof RegisterResSchema>;

export const VerificationCodeSchema = z.object({
    id: z.number(),
    email: z.string().email(),
    code: z.string().length(6),
    type: z.enum([VERIFICATION_CODE_TYPE.REGISTER, VERIFICATION_CODE_TYPE.FORGOT_PASSWORD]),
    expiresAt: z.date(),
    createdAt: z.date(),
});

export type VerificationCodeType = z.infer<typeof VerificationCodeSchema>;

export const SendOTPBodySchema = VerificationCodeSchema.pick({
    email: true,
    type: true,
})

export type SendOTPBodyType = z.infer<typeof SendOTPBodySchema>;