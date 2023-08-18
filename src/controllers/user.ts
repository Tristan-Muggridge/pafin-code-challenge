import { Request, Response } from "express";
import db from "../db";

export default {
    async getAll(req: Request, res: Response) {
        const users = await db.user.findMany();
        // if (users.length == 0) throw new Error("No users found");   
        res.json(users);
    }
}