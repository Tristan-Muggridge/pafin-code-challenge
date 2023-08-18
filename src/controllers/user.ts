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

export const validateName = (name: string | undefined) => {
    const provided = !!name;
    const length = provided && name.length > 3;

    return {provided, length}
}

export const validateEmail = (email: string | undefined) => {
    const provided = !!email;
    const valid = provided && email.includes("@") && email.split("@")[1].includes(".");
    return {provided, valid}
}

export const validatePassword = (password: string | undefined) => {
    const provided = !!password;
    const length = provided && password.length >= 8;
    const number = provided && !!password.match(/\d+/g);
    const special = provided && !!password.match(/[!@#$%^&*(),.?":{}|<>]/g);

    return {provided, length, number, special}
}

export const validateEmailDbUniqueness = async (email: string | undefined) => {
    return {available: email ? !!(await db.user.findMany({ where: { email } })) : false};
}

export const validateCreatePayload = (payload: any) => {
    const { name, email, password } = payload;
    return {
        name: validateName(name),
        email: validateEmail(email),
        password: validatePassword(password),
    };
}