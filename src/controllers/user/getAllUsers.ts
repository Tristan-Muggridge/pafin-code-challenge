import { Request, Response } from "express";
import { User } from "@prisma/client";
import IDB from "../../database/db";

import httpCodes from "../../enums/httpCodes";
import status from "../../enums/jsonStatus";
import JSONResponse from "../../JsonResponse";

type GetAllURLQueryParams = {
    skip?: string
    take?: string
    sort?: string
    order?: string
}

enum ErrorMessages {
    SkipGTUsers = "Skip is greater than the number of users.",
    Users0 = "No users found.",
    SkipNaN = "Skip is not a number.",
    TakeNaN = "Take is not a number.",
    TakeGT100 = "Take is greater than 100.",
    TakeLT1 = "Take is less than 1.",
    SortInvalid = "Sort is invalid.",
    OrderInvalid = "Order is invalid.",
    SkipLT0 = "Skip is less than 0.",
}

const takeSettings = {
    min: 1,
    max: 100,
    default: 25,
};

const skipSettings = {
    min: 0,
    default: 0,
};

const parseNumberOrDefault = (value: string | undefined, defaultValue: number) => {
    const parsed = parseInt(value ?? '');
    return isNaN(parsed) ? defaultValue : parsed;
}

const calculateTotalPages = (totalUsers: number, take: number) => Math.ceil(totalUsers / take);
const calcualteCurrentPage = (skip: number, take: number) => Math.floor(skip / take) + 1;

const parseQueryParams = (queryParams: GetAllURLQueryParams): {
    skip: number
    take: number
    sort: string | undefined
    order: string | undefined
} => {
    const { skip: skipString, take: takeString, sort, order } = queryParams;


    const skip = parseNumberOrDefault(skipString, skipSettings.default);
    const take = parseNumberOrDefault(takeString, takeSettings.default);
    
    return { skip, take, sort, order };
}

export default async (req: Request, res: Response, db: IDB) => {
    
    // Provide more control over the GET request via query params
    const { skip, take, sort: sortBy, order } = parseQueryParams(req.query);
    
    // If skip is less than the minimum notify user
    if (skip < skipSettings.min) {
        const response = JSONResponse(status.fail, {skip: ErrorMessages.SkipLT0});
        res.status(httpCodes.BadRequest).json(response);
        return;
    }
    
    // If take is less than the minimum notify user
    if (take < takeSettings.min) {
        const response = JSONResponse(status.fail, {take: ErrorMessages.TakeLT1});
        res.status(httpCodes.BadRequest).json(response);
        return;
    }

    // If take is greater than the maximum notify user
    if (take > takeSettings.max) {
        const response = JSONResponse(status.fail, {take: ErrorMessages.TakeGT100});
        res.status(httpCodes.BadRequest).json(response);
        return;
    }

    // If sort is invalid notify user
    if (sortBy && !["name", "email", "id"].includes(sortBy)) {
        const response = JSONResponse(status.fail, {sort: ErrorMessages.SortInvalid});
        res.status(httpCodes.BadRequest).json(response);
        return;
    }

    // If order is invalid notify user
    if (order && !["asc", "desc"].includes(order)) {
        const response = JSONResponse(status.fail, {order: ErrorMessages.OrderInvalid});
        res.status(httpCodes.BadRequest).json(response);
        return;
    }

    const sortOrder = order === "desc" ? "desc" : "asc" as const; 
    const sort = sortBy as keyof User | undefined ?? "id" as keyof User;
 
    // Get the users from the database provided via DI in the constructor
    const users = await db.getAllUsers({
        skip,
        take,
        sort,
        sortOrder,
    });

    const queryUserCount = users.length;
    const totalUserCount = await db.getUserCount();

    const totalPages = calculateTotalPages(totalUserCount, take);
    const currentPage = calcualteCurrentPage(skip, take)

    const responseStatus = queryUserCount === 0 ? status.fail : status.success;

    const message = users.length === 0 ? "No users found." : null;
    const response = JSONResponse(responseStatus, {users}, {totalPages, currentPage, count: queryUserCount, message});
    
    res.status(httpCodes.Ok).json(response);
    return;
}