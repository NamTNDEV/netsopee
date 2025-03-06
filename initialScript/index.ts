import configEnv from "src/shared/config";
import { RoleName } from "src/shared/constants/role.constants";
import { HashService } from "src/shared/services/hash.service";
import { PrismaService } from "src/shared/services/prisma.service";

const prisma = new PrismaService();
const hashService = new HashService();

const main = async () => {
    const isRolesInitialized = await prisma.role.count();
    if (isRolesInitialized) {
        throw new Error('Roles already initialized');
    };

    const roles = await prisma.role.createMany({
        data: [
            {
                name: RoleName.ADMIN,
                description: 'Admin role',
            },
            {
                name: RoleName.CLIENT,
                description: 'Client role',
            },
            {
                name: RoleName.SELLER,
                description: 'Seller role',
            },
        ]
    });

    const adminRole = await prisma.role.findFirstOrThrow({
        where: {
            name: RoleName.ADMIN
        }
    });

    const hashedPassword = await hashService.hash(configEnv.ADMIN_PASSWORD);
    const admin = await prisma.user.create({
        data: {
            email: configEnv.ADMIN_EMAIL,
            name: configEnv.ADMIN_NAME,
            phoneNumber: configEnv.ADMIN_PHONE,
            password: hashedPassword,
            roleId: adminRole.id,
        }
    });

    return {
        rolesCount: roles.count,
        admin
    };
}

main()
    .then((result) => {
        console.log('::: ✅ Roles and Admin initialized :::');
        console.log(result);
    })
    .catch((error) => {
        console.error('::: 🔴 Error initializing roles and admin :::');
        console.error(error);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
