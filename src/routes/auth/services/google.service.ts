import { Injectable } from "@nestjs/common";
import { GoogleUrlStateType } from "../auth.model";
import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import configEnv from "src/shared/config";

@Injectable()
export class GoogleService {
    private readonly oauth2Client: OAuth2Client;

    constructor() {
        this.oauth2Client = new google.auth.OAuth2(
            configEnv.GOOGLE_CLIENT_ID,
            configEnv.GOOGLE_CLIENT_SECRET,
            `${configEnv.HOST}:${configEnv.PORT}/auth/google/callback`
        )
    }

    async getGoogleUrl(googleUrlState: GoogleUrlStateType) {
        const scopes = ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'];
        const stateString = Buffer.from(JSON.stringify(googleUrlState)).toString('base64');
        const url = this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scopes,
            include_granted_scopes: true,
            state: stateString,
        })
        return { url }
    }
}