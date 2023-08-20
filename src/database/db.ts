// Singleton class to manage the prisma client

import { User } from "@prisma/client";

import prismaDb from "./prismaDb";
import memoryDb from "./memoryDb";

export default interface db {
    getUserCount(): Promise<number>;

    getAllUsers: (options: getAllUsersOptions) => Promise<UserSelect[]>;
    getUserById: (id: string) => Promise<UserSelect | null>;

    createUser: (data: UserCreate) => Promise<UserSelect>;
    createUsers: (data: UserCreate[]) => Promise<UserSelect[]>;
    
    updateUser: (id: string, data: UserUpdate) => Promise<UserSelect | null>;

    deleteUser: (id: string) => Promise<UserSelect | null>;

    validateEmailUniqueness: (email: string) => Promise<boolean>;
    validateManyEmailUniqueness: (emailUsers: Map<string, UserCreate>) => Promise<Map<string, UserCreate&{unique:boolean}>>;
}

export type UserSelect = {
    id: string
    name: string
    email: string
}

export type UserUpdate = {
    name?: string
    email?: string
    password?: string
}

export type UserCreate = {
    name: string
    email: string
    password: string
}

export type getAllUsersOptions = {
    skip?: number
    take?: number
    sort?: keyof User
    sortOrder?: 'asc' | 'desc'
}

export {
    prismaDb, 
    memoryDb
}