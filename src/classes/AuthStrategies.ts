import { Request } from "express";
import db from "../database/db";

interface AuthStrategy {
    authenticate(db: db): Promise<string | null>;
}

export class BasicAuthStrategy implements AuthStrategy {
    public db: db;
    public username: string;
    public password: string;

    public async authenticate() {
        return await this.db.basicAuth(this.username, this.password);
    }

    constructor(req: Request, db: db) {
        const authHeaderBase64 = req.headers.authorization?.split(' ')[1] || '';
        const [username, password] = Buffer.from(authHeaderBase64, 'base64').toString().split(':');

        this.username = username;
        this.password = password;
        this.db = db;
    }
}
