import { Injectable } from "@nestjs/common";
import { Resend } from "resend";
import configEnv from "../config";
import * as React from 'react'
import { OTPEmail } from 'emails/otp'

@Injectable()
export class EmailService {
    private resend: Resend;

    constructor() {
        this.resend = new Resend(configEnv.RESEND_API_KEY);
    }

    async sendEmail(payload: { email: string, content: string, subject: string }) {
        return this.resend.emails.send({
            from: `Netsopee <no-reply@${configEnv.RESEND_DOMAIN}>`,
            // from: 'Netsopee <onboarding@resend.dev>',
            to: [payload.email],
            // to: ['namtndev312002@gmail.com'],
            subject: payload.subject,
            react: <OTPEmail otpCode={payload.content} title={payload.subject} />,
        });
    }
}