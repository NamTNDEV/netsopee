import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';

import { RoleService } from './services/role.service';
import { AuthRepository } from './auth.repository';
import { AuthService } from './services/auth.service';
import { GoogleService } from './services/google.service';

@Module({
  controllers: [AuthController],
  providers: [AuthRepository, AuthService, RoleService, GoogleService]
})
export class AuthModule { }
