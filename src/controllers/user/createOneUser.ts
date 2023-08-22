import { Request, Response } from "express";
import IDB, { UserCreate } from "../../database/db";

import httpCodes from "../../enums/httpCodes";
import status from "../../enums/jsonStatus";
import JSONResponse from "../../JsonResponse";

import UserValidation from "./UserValidation";

enum ErrorMessages {
    NoId = "No user id provided in url parameters.",
    UserNotFound = "User not found.",
}

export default async (req: Request, res: Response, db: IDB) => {
    const user = req.body as UserCreate;

    const validation = UserValidation(user);

    if (!validation.valid) {
        const response = JSONResponse(status.fail, {
            name: validation.name.messages,
            email: validation.email.messages,
            password: validation.password.messages,
        });
        res.status(httpCodes.BadRequest).json(response);
        return;
    }

    const emailUniqueness = await db.validateEmailUniqueness(user.email);

    if (!emailUniqueness) {
        const response = JSONResponse(status.fail, {email: "Email already exists."});
        res.status(httpCodes.BadRequest).json(response);
        return;
    }

    const created = await db.createUser(user);

    if (!created) throw new Error("Unable to create user");

    const response = JSONResponse(status.success, {user: created});
    
    res.status(httpCodes.Created).json(response);
    return;
}