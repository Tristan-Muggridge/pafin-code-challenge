import { Request, Response } from "express";
import { User } from "@prisma/client";
import db from "../db";

import httpCodes from "../enums/httpCodes";
import status from "../enums/jsonStatus";

interface Controller {
    [key: string]: (req: Request, res: Response) => void
}

class JSONResponse {
    status: status;
    message?: string;
    data: Object;

    current_page?: number
    total_pages?: number

    constructor(status: status, data: Object, message?:string, additionalInfo?: {
        currentPage?: number
        totalPages?: number
    }) {
        this.status = status;
        this.data = {...data};
        if (message) this.message = message;
        
        if (additionalInfo) {
            this.current_page = additionalInfo.currentPage;
            this.total_pages = additionalInfo.totalPages;
        }
    }
}

const minNameLength = 3;
const minPasswordLength = 8;
const minPasswordNumber = 1;
const minPasswordSpecial = 1;

const controller: Controller = {
    getAll: async (req: Request, res: Response) => {
        
        type QueryParams = {
            skip?: string
            take?: string
            sort?: string
            order?: string
        }

        const takeSettings = {
            min: 1,
            max: 100,
            default: 10,
        };

        const sortFields: Array<keyof User> = ["name", "email", "id"];

        const { skip: skipString, take: takeString, sort: sortString, order: orderString } = req.query as QueryParams;
        
        const skipNumber = +(skipString ?? 0);
        const takeNumber = +(takeString ?? takeSettings.default);
        const sort = sortString && sortFields.includes(sortString as keyof User) ? sortString : "id";
        const sortOrder = orderString === "desc" ? "desc" : "asc";

        // If skip is a negative number, use 0
        const skip = skipNumber >= 0 ? skipNumber : 0;
        
        // If take is not a number or is outside the range of min and max, use the default
        const take = takeNumber >= takeSettings.min && takeNumber <= takeSettings.max 
            ? takeNumber 
            : takeSettings.default;

        const users = await db.user.findMany({
            skip,
            take,
            orderBy: {
                [sort]: sortOrder,
            },
            select: {
                id: true,
                name: true,
                email: true,
            }
        });

        const pages = Math.ceil((await db.user.count()) / take);

        const message = users.length === 0 ? "No users found." : "";
        const response = new JSONResponse(status.success, {users}, message, {totalPages: pages, currentPage: Math.ceil(skip / take) + 1});
        
        res.status(httpCodes.Ok).json(response);
    },

    getOne: async (req: Request, res: Response) => {
        const { id } = req.params;

        if (!id) {
            const response = new JSONResponse(status.fail, {id: "No user id provided in url parameters."});
            res.status(httpCodes.BadRequest).json(response);
            return;
        }

        const user = await db.user.findUnique({
            where: {
                id: id,
            },
            select: {
                id: true,
                name: true,
                email: true,
            }
        });

        const response = new JSONResponse(status.success, {user});
        res.status(httpCodes.Ok).json(response);
    },
    
    create: async (req: Request, res: Response) => {
        
        type ValidationMessages = {
            name: string[]
            email: string[]
            password: string[]
        }
        
        const {name: nameValidity, email: emailValidity, password: passwordValidity} = validateCreatePayload(sanitisePayload(req.body));
        
        // Construct an array of all the validation errors
        const errors: ValidationMessages = {
            name: [],
            email: [],
            password: [],
        };
        
        if (!nameValidity.provided) errors.name.push("Name is required.");
        if (!nameValidity.length) errors.name.push(`Name must be at least ${minNameLength} characters long.`);

        if (!emailValidity.provided) errors.email.push("Email is required.");
        if (!emailValidity.valid) errors.email.push("Email is invalid.");
        
        if (!passwordValidity.provided) errors.password.push("Password is required.");
        if (!passwordValidity.length) errors.password.push(`Password must be at least ${minPasswordLength} characters long.`);
        if (!passwordValidity.numbers) errors.password.push(`Password must contain at least ${minPasswordNumber} number.`);
        if (!passwordValidity.specials) errors.password.push(`Password must contain at least ${minPasswordSpecial} special character.`);

        // Remove empty arrays from the errors object
        for (const key in errors) {
            if (errors[key as keyof typeof errors].length === 0) delete errors[key as keyof typeof errors];
        }

        if (Object.keys(errors).length > 0) {
            const response = new JSONResponse(status.fail, errors);
            res.status(httpCodes.BadRequest).json(response);
            
            return;
        }

        const available = await validateEmailDbUniqueness(emailValidity.value);
        
        if (!available) {
            const response = new JSONResponse(status.fail, {email: "Email is already in use."});
            res.status(httpCodes.BadRequest).json(response);   
            return;
        }

        const user = await db.user.create({
            data: {
                name: nameValidity.value,
                email: emailValidity.value,
                password: passwordValidity.value,
            },
            select: {
                id: true,
                name: true,
                email: true,
            }
        });

        return res.status(httpCodes.Created).json(new JSONResponse(status.success, {user}));
    },

    update: async (req: Request, res: Response) => new Error("Not implemented"),
    delete: async (req: Request, res: Response) => new Error("Not implemented"),
}

export default controller;

export const validateName = (name: string | undefined) => {
    const provided = !!name;
    const length = provided && name.length > minNameLength;

    return {provided, length}
}

export const validateEmail = (email: string | undefined) => {
    const provided = !!email;
    const valid = provided && email.includes("@") && email.split("@")[1].includes(".");
    return {provided, valid}
}

export const validatePassword = (password: string | undefined) => {
    const provided = !!password;
    const length = provided && password.length >= minPasswordLength;
    const numbers = provided && ( (password.match(/\d+/g)?.length ?? 0) >= minPasswordNumber);
    const specials = provided && ( (password.match(/[!@#$%^&*(),.?":{}|<>]/g)?.length ?? 0) >= minPasswordSpecial);

    return {provided, length, numbers, specials}
}

export const validateEmailDbUniqueness = async (email: string | undefined) => {
    if (!email) return false;
    
    const user = await db.user.findUnique({
        where: {
            email,
        }
    });

    return !user;
}

export const sanitisePayload = (payload: any) => {
    const { name, email, password } = payload;
    
    let sanitisedName = name ? name.trim() : undefined;
    let sanitisedEmail = email ? email.trim() : undefined;

    // ensure no code injection and no XSS
    sanitisedName = sanitisedName ? sanitisedName.replace(/</g, "&lt;").replace(/>/g, "&gt;") : undefined;
    sanitisedEmail = sanitisedEmail ? sanitisedEmail.replace(/</g, "&lt;").replace(/>/g, "&gt;") : undefined;

    return {
        name: name ? name.trim() : undefined,
        email: email ? email.trim() : undefined,
        password: password ? password.trim() : undefined,
    };
}

export const validateCreatePayload = (payload: any) => {
    const { name, email, password } = payload;
    
    return {
        name: {
            ...validateName(name),
            value: name,
        },
        email: {
            ...validateEmail(email),
            value: email,
        },
        password: {
            ...validatePassword(password),
            value: password,
        }
    };
}