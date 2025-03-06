export class UserModel {
    id: number;
    name: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;

    constructor(partial: Partial<UserModel>) {
        Object.assign(this, partial);
    }
}