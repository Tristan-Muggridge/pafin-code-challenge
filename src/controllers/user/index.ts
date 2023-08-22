import { Request, Response } from "express";
import db from "../../database/db";

import httpCodes from "../../enums/httpCodes";
import status from "../../enums/jsonStatus";
import JSONResponse from "../../JsonResponse";

// Implementations of the controller methods
import getAllUsers from "./getAllUsers";
import getOneUser from "./getOneUser";
import createOneUser from "./createOneUser";
import createManyUsers from "./createManyUsers";
import updateOneUser from "./updateOneUser";
import deleteOneUser from "./deleteOneUser";

interface IUserController {
    getAllUsers(req: Request, res: Response, db: db): Promise<void>;
    getOne(req: Request, res: Response): Promise<void>;
    create(req: Request, res: Response): Promise<void>;
    update(req: Request, res: Response): Promise<void>;
    delete(req: Request, res: Response): Promise<void>;
}

class UserController implements IUserController {
    
    private db: db;

    constructor(db: db) {
        this.db = db;
    }

    public getAllUsers = (req: Request, res: Response) => getAllUsers(req, res, this.db);
    public getOne = async (req: Request, res: Response) => getOneUser(req, res, this.db);
    
    // Determine if the request body is an array or a single object and call the appropriate method
    public create = async (req: Request, res: Response) => {
        if (!req.body) {
            const response = JSONResponse(status.fail, {body: "No body provided."});
            res.status(httpCodes.BadRequest).json(response);
            return;
        }

        Array.isArray(req.body)
        ? this.createMany(req, res)
        : this.createOne(req, res);
        
        return;
    }

    public createOne = async (req: Request, res: Response) => createOneUser(req, res, this.db);
    public createMany = async (req: Request, res: Response) => createManyUsers(req, res, this.db);

    public update = async (req: Request, res: Response) => updateOneUser(req, res, this.db);

    public delete = async (req: Request, res: Response) => deleteOneUser(req, res, this.db);
}

export default (db: db) => new UserController(db);