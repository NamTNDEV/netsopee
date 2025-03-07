import { Injectable } from "@nestjs/common";
import { Resend } from "resend";
import configEnv from "../config";

@Injectable()
export class EmailService {
    private resend: Resend;
    constructor() {
        this.resend = new Resend(configEnv.RESEND_API_KEY);
    }

    async sendEmail(payload: { email: string, content: string, subject: string }) {
        return this.resend.emails.send({
            // from: `Netsopee <no-reply@${configEnv.HOST}>`,
            from: 'Netsopee <onboarding@resend.dev>',
            // to: [payload.email],
            to: ['namtndev312002@gmail.com'],
            subject: payload.subject,
            html: `<strong>${payload.content}</strong>`,
        });
    }
}