import zod from 'zod';
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';
import { exit } from 'process';

config({
    path: '.env'
});

if (!fs.existsSync(path.resolve('.env'))) {
    console.error('::: 🔴 .env file not found :::');
    exit(1);
}

const configEnvSchema = zod.object({
    DATABASE_URL: zod.string(),
    PORT: zod.string(),
    CLIENT_URL: zod.string(),
    JWT_REFRESH_TOKEN_EXPIRE: zod.string(),
    JWT_ACCESS_TOKEN_EXPIRE: zod.string(),
    JWT_REFRESH_TOKEN_PRIVATE_KEY: zod.string(),
    JWT_ACCESS_TOKEN_PRIVATE_KEY: zod.string(),
    API_KEY: zod.string()
});

const configEnvInstance = configEnvSchema.safeParse(process.env);

if (!configEnvInstance.success) {
    console.error("::: 🔴 Invalid .env file ::: ", configEnvInstance.error);
    exit(1);
}

const configEnv = configEnvInstance.data;
export default configEnv;
