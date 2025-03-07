import { Global, Module } from '@nestjs/common';
import { PrismaService } from './services/prisma.service';
import { HashService } from './services/hash.service';
import { JwtModule } from '@nestjs/jwt';
import { TokenService } from './services/token.service';
import { ApiKeyGuard } from './guards/api-key.guard';
import { AccessTokenGuard } from './guards/access-token.guard';
import { APP_GUARD } from '@nestjs/core';
import { AuthenticationGuard } from './guards/authentication.guard';
import { SharedUserRepository } from './repositories/shared-user.repositories';
import { EmailService } from './services/email.service';

const SharedServices = [PrismaService, HashService, TokenService, EmailService];
const SharedRepositories = [SharedUserRepository];

@Global()
@Module({
    providers: [...SharedServices, ...SharedRepositories, AccessTokenGuard, ApiKeyGuard, {
        provide: APP_GUARD,
        useClass: AuthenticationGuard
    }],
    exports: [...SharedServices, ...SharedRepositories],
    imports: [JwtModule],
})
export class SharedModule { }
