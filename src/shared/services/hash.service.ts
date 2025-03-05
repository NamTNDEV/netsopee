import { Injectable } from "@nestjs/common";
import { compareSync, hashSync } from "bcrypt";

const HASH_SALT_ROUNDS = 10;

@Injectable()
export class HashService {
    hash(payload: string) {
        return hashSync(payload, HASH_SALT_ROUNDS);
    }

    compare(payload: string, hash: string) {
        return compareSync(payload, hash);
    }
}