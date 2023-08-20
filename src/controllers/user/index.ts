import { Request, Response } from "express";
import { User } from "@prisma/client";
import db, { UserCreate } from "../../database/db";

import httpCodes from "../../enums/httpCodes";
import status from "../../enums/jsonStatus";
import JSONResponse from "../../JsonResponse";

import UserValidation from "./UserValidation";

type Payload = {
    name: string
    email: string
    password: string
}

class UserController {
    
    private db: db;

    constructor(db: db) {
        this.db = db;
    }

    public getAll = async (req: Request, res: Response) => {
        
        type QueryParams = {
            skip?: string
            take?: string
            sort?: keyof User
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

        // Get the users from the database provided via DI in the constructor
        const users = await this.db.getAllUsers({
            skip,
            take,
            sort,
            sortOrder,
        });


        const userCount = await this.db.getUserCount();
        const pages = Math.ceil( userCount / take);

        const message = users.length === 0 ? "No users found." : "";
        const response = JSONResponse(status.success, {users}, {totalPages: pages, currentPage: Math.ceil(skip / take) + 1, count: users.length, message});
        
        res.status(httpCodes.Ok).json(response);
    }

    public getOne = async (req: Request, res: Response) => {
        const { id } = req.params;

        if (!id) {
            const response = JSONResponse(status.fail, {id: "No user id provided in url parameters."});
            res.status(httpCodes.BadRequest).json(response);
            return;
        }

        const user = await this.db.getUserById(id);

        const response = JSONResponse(status.success, {user});
        res.status(httpCodes.Ok).json(response);
    }
    
    public create = async (req: Request, res: Response) => {
        if (!req.body) {
            const response = JSONResponse(status.fail, {body: "No body provided."});
            res.status(httpCodes.BadRequest).json(response);
            return;
        }

        Array.isArray(req.body)
        ? this.createMany(req, res)
        : this.createOne(req, res);
    }

    public createOne = async (req: Request, res: Response) => {
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

        const emailUniqueness = await this.db.validateEmailUniqueness(user.email);

        if (!emailUniqueness) {
            const response = JSONResponse(status.fail, {email: "Email already exists."});
            res.status(httpCodes.BadRequest).json(response);
            return;
        }

        const created = await this.db.createUser(user);

        const response = JSONResponse(status.success, {user: created});
        res.status(httpCodes.Created).json(response);
    }

    public createMany = async (req: Request, res: Response) => {                
        const users = req.body as UserCreate[];
        
        const responseObj:any = { [status.success]: [] };
        const validatedUsers: Map<string, UserCreate> = new Map();

        users.forEach( (user, index) => {
            const validation = UserValidation(user);
            
            if (!validation.valid) {
                responseObj[status.fail] = { ...responseObj[status.fail] ?? {} }
                responseObj[status.fail][user.email ?? index] = {
                    name: validation.name.messages,
                    email: validation.email.messages,
                    password: validation.password.messages,
                };

                return;
            }

            validatedUsers.set(user.email, user);
        });
        
        const emailUniqueness = await this.db.validateManyEmailUniqueness(validatedUsers);
        
        const usersToCreate: Array<UserCreate> = [];

        validatedUsers.forEach( (user, email) => {
            emailUniqueness.get(email)?.unique 
                ? usersToCreate.push(user) 
                : responseObj[status.fail] = { ...responseObj[status.fail] ?? {}, [email]: {email: "Email already exists."} };
        });

        const createdUsers = await this.db.createUsers(usersToCreate);

        responseObj[status.success] = createdUsers;

        const response = JSONResponse(status.success, {...responseObj});
        return res.status(httpCodes.Created).json({...response});
    }

    public update = async (req: Request, res: Response) => {
        
        // get the id from the url query params
        // if no id is provided, return a 400

        const { id } = req.params as {id: string};
        if (!id) {
            const response = JSONResponse(status.fail, {id: "No user id provided in url parameters."});
            res.status(httpCodes.BadRequest).json(response);
            return;
        }

        // get the name, email, and password from the body
        // santise the payload
        // validate the payload

        const payload = req.body as Payload;
        const validation = UserValidation(payload);

        // if the payload is invalid, return a 400 with the errors
        
        // only check for fields present in payload
        const errors: any = {};
        if (payload.name) errors.name = validation.name.messages;
        if (payload.email) errors.email = validation.email.messages;
        if (payload.password) errors.password = validation.password.messages;

        if (errors.name || errors.email || errors.password) {
            const response = JSONResponse(status.fail, {errors});
            res.status(httpCodes.BadRequest).json(response);
            return;
        }

        // if the payload is valid, update the user and return a 204
        const update = await this.db.updateUser(id, payload);

        // if the update is null (user not found) return a 404
        if (!update) {
            const response = JSONResponse(status.fail, {id: "No user found with that id."});
            res.status(httpCodes.NotFound).json(response);
            return;
        }

        const response = JSONResponse(status.success, {user: update});
        res.status(httpCodes.Ok).json(response);
    }

    public delete = async (req: Request, res: Response) => {
        const { id } = req.params;

        if (!id) {
            const response = JSONResponse(status.fail, {id: "No user id provided in url parameters."});
            res.status(httpCodes.BadRequest).json(response);
            return;
        }

        try {
            const user = await this.db.deleteUser(id);
        } catch {
            const response = JSONResponse(status.fail, {id: "No user found with that id."});
            res.status(httpCodes.NotFound).json(response);
            return;
        }

        const response = JSONResponse(status.success, null, "User deleted.");
        res.status(httpCodes.NoContent).json(response);
    }
}

export default (db: db) => new UserController(db);