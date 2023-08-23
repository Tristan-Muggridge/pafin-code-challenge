import { Request, Response } from "express";
import IDB from "../../database/db";

import httpCodes from "../../enums/httpCodes";
import status from "../../enums/jsonStatus";
import JSONResponse from "../../JsonResponse";

enum Messages {
    NoId = "No user id provided in url parameters.",
    UserNotFound = "User not found.",
    Deleted = "User deleted successfully.",
}

export default async (req: Request, res: Response, db: IDB) => {
    const { id } = req.params as {id: string};

    if (!id) {
        const response = JSONResponse(status.fail, {id: Messages.NoId});
        res.status(httpCodes.BadRequest).json(response);
        return;
    }

    let user;

    try {
        user = await db.deleteUser(id);
    } catch (error:any) {
        if (!error.message.includes("Record to delete does not exist.")) throw error;
        
        const response = JSONResponse(status.fail, {id: Messages.UserNotFound});
        res.status(httpCodes.NotFound).json(response);
        return;
    }

    console.debug(user);

    if (!user) {
        const response = JSONResponse(status.fail, {id: Messages.UserNotFound});
        res.status(httpCodes.NotFound).json(response);
        return;
    }

    const response = JSONResponse(status.success, null, {message: Messages.Deleted});
    res.status(httpCodes.NoContent).json(response);

    return;
}