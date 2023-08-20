import { User } from "@prisma/client";
import { randomUUID } from "crypto";
import db, { getAllUsersOptions, UserCreate, UserUpdate } from "./db";

class memoryDb implements db {

    private static instance: memoryDb;
    private users: Map<string, User>;

    private constructor() {
        this.users = new Map();
    }

    public static getInstance(): memoryDb {
        if (!memoryDb.instance) {
            memoryDb.instance = new memoryDb();
        }

        return memoryDb.instance;
    }

    public async getUserCount() {
        return this.users.size;
    }

    public async getAllUsers(options: getAllUsersOptions) {
        const users = Array.from(this.users.values());
        
        const {skip, take, sort, sortOrder} = options;

        if (skip) users.splice(0, skip);
        if (take) users.splice(take);
        if (sort) users.sort((a, b) => {
            if (a[sort] < b[sort]) return sortOrder === 'asc' ? -1 : 1;
            if (a[sort] > b[sort]) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
        
        return users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
        }));
    }

    public async getUserById(id: string) {
        const user = this.users.get(id) || null;
        return {
            id: user?.id || '',
            name: user?.name || '',
            email: user?.email || '',
        }
    }

    public async createUser(data: UserCreate) {
        
        const dataWithId = {
            ...data,
            id: randomUUID() as string,
        };

        this.users.set(dataWithId.id, dataWithId);
        return {
            id: dataWithId.id,
            name: dataWithId.name,
            email: dataWithId.email,
        };
    }

    public async createUsers(data: UserCreate[]) {
        const users = data.map(user => ({
            ...user,
            id: randomUUID() as string,
        }));

        users.forEach(user => this.users.set(user.id, user));
        return users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
        }));
    }

    public async updateUser(id: string, data: UserUpdate) {
        const original = this.users.get(id) || null;
        if (!original) return null;

        this.users.set(id, {...original, ...data});
        const updated = this.users.get(id) || null;
        if (!updated) return null;
        
        return {
            id,
            name: updated.name,
            email: updated.email,
        };
    }

    public async deleteUser(id: string) {
        const user = this.users.get(id) || null;
        this.users.delete(id);
        return {
            id: user?.id || '',
            name: user?.name || '',
            email: user?.email || '',
        };
    }

    public async validateEmailUniqueness(email: string) {
        const users = Array.from(this.users.values());
        return users.every(user => user.email !== email);
    }

    public async validateManyEmailUniqueness(emailUsers: Map<string, UserCreate>) {
        const emailUniquenessMap = new Map<string, UserCreate&{unique:boolean}>();
        const emails: string[] = [];

        emailUsers.forEach( (user, email) => {
            emailUniquenessMap.set(email, {...user, unique: true});
            emails.push(email);
        });

        const users = Array.from(this.users.values());

        users.forEach(user => {
            if (emails.includes(user.email)) {
                const record = emailUniquenessMap.get(user.email);
                if (record) record.unique = false;
            }
        });

        return emailUniquenessMap;
    }
}

export default memoryDb.getInstance();