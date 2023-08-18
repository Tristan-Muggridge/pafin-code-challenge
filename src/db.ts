// Singleton class to manage the prisma client

import { PrismaClient } from "@prisma/client";

class db {
    private static instance: db;
    public _db: PrismaClient;

    private constructor() {
        this._db = new PrismaClient();
    }

    public static getInstance(): db {
        if (!db.instance) {
            db.instance = new db();
        }

        return db.instance;
    }

    public get db(): PrismaClient {
        return this._db;
    }
}

export default db.getInstance().db;