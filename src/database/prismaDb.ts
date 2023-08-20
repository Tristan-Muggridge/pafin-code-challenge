import { PrismaClient, User } from "@prisma/client";
import db, { getAllUsersOptions, UserCreate, UserSelect, UserUpdate } from "./db";

class prismaDb implements db {

    private static instance: prismaDb;
    private prisma: PrismaClient;

    private constructor() {
        this.prisma = new PrismaClient();
    }

    public static getInstance(): prismaDb {
        if (!prismaDb.instance) {
            prismaDb.instance = new prismaDb();
        }

        return prismaDb.instance;
    }

    public async getAllUsers(options: getAllUsersOptions = {}) {
        const {skip, take, sort, sortOrder} = options;
        
        return await this.prisma.user.findMany({
            skip,
            take,
            orderBy: {
                [sort as string]: sortOrder,
            },
            select: {
                id: true,
                name: true,
                email: true,
            }
        });
    }

    public async getUserCount() {
        return await this.prisma.user.count();
    }

    public async getUserById(id: string) {
        return await this.prisma.user.findUnique({
            where: {
                id: id
            },
            select: {
                id: true,
                name: true,
                email: true,
            }
        });
    }

    public async createUser(data: UserCreate) {
        return await this.prisma.user.create({
            data,
            select: {
                id: true,
                name: true,
                email: true,
            }
        });
    }

    public async createUsers(data: UserCreate[]) {
        const users = await this.prisma.user.createMany({
            data,
        })

        return users.count as number == data.length
            ? this.prisma.user.findMany({
                where: {
                    name: {
                        in: data.map(user => user.name),
                    },
                    email: {
                        in: data.map(user => user.email),
                    },
                },
            })
            : [];
    }

    public async updateUser(id: string, data: UserUpdate) {
        return await this.prisma.user.update({
            where: { id },
            data,
            select: {
                id: true,
                name: true,
                email: true,
            }
        });
    }

    public async deleteUser(id: string) {
        return await this.prisma.user.delete({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
            }
        });
    }

    public async validateEmailUniqueness(email: string) {
        const result = await this.prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                name: true,
                email: true,
            }
        });

        return !result;
    }

    public async validateManyEmailUniqueness(emailUsers: Map<string, UserCreate>) {
        
        // get emails from map
        const emailUniquenessMap = new Map<string, UserCreate&{unique:boolean}>();
        const emails: string[] = [];

        emailUsers.forEach( (user, email) => {
            emailUniquenessMap.set(email, {...user, unique: true});
            emails.push(email);
        });

        // check prisma to see which emails are unique
        const results = await this.prisma.user.findMany({
            where: {
                email: {
                    in: emails,
                }
            },
            select: {
                email: true,
            }
        });

        // add unique property to each user
        results.forEach( result => {
            const record = emailUniquenessMap.get(result.email);
            if (record) record.unique = false;
        })

        return emailUniquenessMap;
    }
}

export default prismaDb.getInstance();