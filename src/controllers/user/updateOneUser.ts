import { Request, Response } from "express";
import IDB from "../../database/db";

import httpCodes from "../../enums/httpCodes";
import status from "../../enums/jsonStatus";
import JSONResponse from "../../JsonResponse";

import UserValidation from "./UserValidation";

enum ErrorMessages {
    NoId = "No user id provided in url parameters.",
    UserNotFound = "User not found.",
}

type Payload = {
    name: string
    email: string
    password: string
}

export default async (req: Request, res: Response, db: IDB) => {                 
    const { id } = req.params as {id: string};
    
    if (!id) {
        const response = JSONResponse(status.fail, {id: ErrorMessages.NoId});
        res.status(httpCodes.BadRequest).json(response);
        return;
    }

    const payload = req.body as Payload;
    const validation = UserValidation(payload);
    
    // only check for fields present in payload
    const errors: any = {};
    if (payload.name) errors.name = validation.name.messages;
    if (payload.email) errors.email = validation.email.messages;
    if (payload.password) errors.password = validation.password.messages;

    if (errors.name || errors.email || errors.password) {
        const response = JSONResponse(status.fail, {data: errors});
        res.status(httpCodes.BadRequest).json(response);
        return;
    }

    // if the payload is valid, update the user and return a 204
    const update = await db.updateUser(id, payload);

    // if the update is null (user not found) return a 404
    if (!update) {
        const response = JSONResponse(status.fail, null, {message: ErrorMessages.UserNotFound});
        res.status(httpCodes.NotFound).json(response);
        return;
    }

    const response = JSONResponse(status.success, {user: update});
    res.status(httpCodes.Ok).json(response);
    return;
}
