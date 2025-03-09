import { createZodDto } from "nestjs-zod";
import { LoginBodySchema, LoginResSchema, RefreshTokenBodySchema, RegisterBodySchema, RegisterResSchema, SendOTPBodySchema } from "./auth.model";
import { MessageResDto } from "src/shared/dto/response.dto";

export class RegisterBodyDto extends createZodDto(RegisterBodySchema) { }
export class RegisterResDto extends createZodDto(RegisterResSchema) { }
export class SendOtpBodyDto extends createZodDto(SendOTPBodySchema) { }
export class SendOtpResDto extends MessageResDto { }
export class LoginBodyDto extends createZodDto(LoginBodySchema) { }
export class LoginResDto extends createZodDto(LoginResSchema) { }
export class RefreshTokenBodyDto extends createZodDto(RefreshTokenBodySchema) { }
export class RefreshTokenResDto extends LoginResDto { }
export class LogoutBodyDto extends RefreshTokenBodyDto { }
export class LogoutResDto extends MessageResDto { }