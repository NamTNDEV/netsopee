import { Injectable } from "@nestjs/common";
import { RoleName } from "src/shared/constants/role.constants";
import { PrismaService } from "src/shared/services/prisma.service";

@Injectable()
export class RoleService {
    private clientRoleId: number | undefined;
    constructor(private readonly prismaService: PrismaService) { };

    async getClientRoleId() {
        if (!this.clientRoleId) {
            const clientRole = await this.prismaService.role.findFirstOrThrow({
                where: {
                    name: RoleName.CLIENT
                }
            });
            this.clientRoleId = clientRole.id;
        }
        return this.clientRoleId;
    }
}