import { Request, Response } from "express";
import IDB from "../../database/db";

import httpCodes from "../../enums/httpCodes";
import status from "../../enums/jsonStatus";
import JSONResponse from "../../JsonResponse";

enum ErrorMessages {
    NoId = "No user id provided in url parameters.",
    UserNotFound = "User not found.",
}

export default async (req: Request, res: Response, db: IDB) => {
    const { id } = req.params as {id: string};

    if (!id) {
        const response = JSONResponse(status.fail, {id: ErrorMessages.NoId});
        res.status(httpCodes.BadRequest).json(response);
        return;
    }

    const user = await db.getUserById(id);

    if (!user) {
        const response = JSONResponse(status.fail, null, {message: ErrorMessages.UserNotFound});
        res.status(httpCodes.NotFound).json(response);
        return;
    }

    const response = JSONResponse(status.success, {user});
    res.status(httpCodes.Ok).json(response);
    return;
}