import { UserStatus } from "@prisma/client";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const RegisterBodySchema = z.object({
    email: z.string().email(),
    password: z.string().min(6).max(500),
    confirmPassword: z.string(),
    name: z.string().min(1).max(500),
    phoneNumber: z.string().min(10).max(15),
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
    });

const UserSchema = z.object({
    id: z.number(),
    email: z.string(),
    name: z.string(),
    phoneNumber: z.string(),
    avatar: z.string().nullable(),
    status: z.enum([UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.BLOCKED]),
    roleId: z.number(),
    createdById: z.number().nullable(),
    updatedById: z.number().nullable(),
    deletedAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export class RegisterBodyDto extends createZodDto(RegisterBodySchema) { }
export class UserResDto extends createZodDto(UserSchema) { }