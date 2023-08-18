import { Request, Response } from "express";
import db from "../db";
import httpCodes from "../enums/httpCodes";

interface Controller {
    [key: string]: (req: Request, res: Response) => void
}

class JSONResponse {
    status: number;
    message?: string;
    data: Object;

    constructor(status: number, data: Object, message?:string) {
        this.status = status;
        this.data = {...data};
        if (message) this.message = message;
    }
}

const controller: Controller = {
    getAll: async (req: Request, res: Response) => {
        const users = await db.user.findMany();
        const message = users.length === 0 ? "No users found." : "";
        const response = new JSONResponse(httpCodes.Ok, {users}, message);
        res.json(response);
    },

    getOne: async (req: Request, res: Response) => new Error("Not implemented"),
    create: async (req: Request, res: Response) => new Error("Not implemented"),
    update: async (req: Request, res: Response) => new Error("Not implemented"),
    delete: async (req: Request, res: Response) => new Error("Not implemented"),
}

export default controller;