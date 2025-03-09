import { Injectable } from "@nestjs/common";
import { GoogleUrlStateType } from "../auth.model";
import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import configEnv from "src/shared/config";
import { AuthRepository } from "../auth.repository";
import { RoleService } from "./role.service";
import { HashService } from "src/shared/services/hash.service";
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from "./auth.service";

@Injectable()
export class GoogleService {
    private readonly oauth2Client: OAuth2Client;

    constructor(
        private readonly authRepository: AuthRepository,
        private readonly roleService: RoleService,
        private readonly hashService: HashService,
        private readonly authService: AuthService
    ) {
        this.oauth2Client = new google.auth.OAuth2(
            configEnv.GOOGLE_CLIENT_ID,
            configEnv.GOOGLE_CLIENT_SECRET,
            `${configEnv.HOST}:${configEnv.PORT}/auth/google/callback`
        )
    }

    async getGoogleUrl(googleUrlState: GoogleUrlStateType) {
        const scopes = ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email']
        const stateString = Buffer.from(JSON.stringify(googleUrlState)).toString('base64');
        const url = this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            include_granted_scopes: true,
            state: stateString,
        })
        return { url }
    }

    getGoogleState(stateString: string): GoogleUrlStateType {
        try {
            const state = JSON.parse(Buffer.from(stateString, 'base64').toString());
            return state;
        } catch (error) {
            console.error("Error from Get Google State::: ", error);
            return {
                ip: "Unknown IP",
                userAgent: "Unknown User Agent"
            }
        }
    }

    async getGoogleProfile() {
        const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
        const { data } = await oauth2.userinfo.get();
        if (!data.email) {
            throw new Error("Email not found from Google");
        }
        return data
    }

    async googleLogin({ code, stateString }: { code: string, stateString: string }) {
        try {
            const { ip: deviceIp, userAgent } = this.getGoogleState(stateString);
            const { tokens } = await this.oauth2Client.getToken(code);
            this.oauth2Client.setCredentials(tokens);
            const googleProfile = await this.getGoogleProfile();
            let user = await this.authRepository.findUserWithRole({
                email: googleProfile.email as string
            })

            if (!user) {
                const roleId = await this.roleService.getClientRoleId();
                const hashedPassword = this.hashService.hash(uuidv4());

                user = await this.authRepository.createGoogleUser({
                    email: googleProfile.email as string,
                    name: googleProfile.name ?? "Anonymous",
                    password: hashedPassword,
                    phoneNumber: '',
                    avatar: googleProfile.picture ?? null,
                    roleId: roleId
                })
            }

            const device = await this.authRepository.createDevice({
                userId: user.id,
                userAgent,
                ip: deviceIp,
            })

            const tokenPair = await this.authService.generateTokenPair({
                userId: user.id,
                deviceId: device.id,
                roleId: user.roleId,
                roleName: "CLIENT"
            });
            return tokenPair;
        } catch (error) {
            console.error("Error from Login with Google::: ", error);
            throw error;
        }
    }
}