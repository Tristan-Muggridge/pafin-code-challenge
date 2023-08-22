import { Request, Response } from "express";
import db from "../../database/db";

import httpCodes from "../../enums/httpCodes";
import JSONResponse from "../../JsonResponse";
import jsonStatus from "../../enums/jsonStatus";

import { sign } from '../../JWT';
import { App } from "../../App";
import { BasicAuthStrategy } from "../../classes/AuthStrategies";

interface IAuthController {
    login(req: Request, res: Response): Promise<void>;
    logout(req: Request, res: Response): void;
}

class AuthController implements IAuthController {
    
    private db: db;

    constructor(db: db) {
        this.db = db;
    }

    public login = async (req: Request, res: Response) => {

        // Authenticate the provided credentials via Basic Auth
        const strategy = new BasicAuthStrategy(req, this.db);
        const authenticated = await strategy.authenticate();
        
        if (!authenticated) {
            res.status(httpCodes.Unauthorized).json(JSONResponse(jsonStatus.fail, undefined, 'Invalid credentials'));
            return;
        }
        
        const token = sign({userId: authenticated})

        res.status(httpCodes.Ok).json(JSONResponse(jsonStatus.success, {token}));
        return;
    }

    public logout = (req: Request, res: Response) => {
        
        // get token from header
        const token = req.headers.authorization?.split(' ')[1] || '';
        
        if (!token) {
            res.status(httpCodes.BadRequest).json(JSONResponse(jsonStatus.fail, undefined, {message: 'Unable to logout. No token provided'}));
            return;
        }
        
        App.tokenNotAllowedList.add(token);

        res.status(httpCodes.Ok).send(JSONResponse(jsonStatus.success, undefined, {message: 'Logged out successfully'}));
        return;
    }

    public TEST_ONLY_create_admin_user = async (req: Request, res: Response) => {
        const user = await this.db.createUser({
            name: 'admin',
            email: 'admin',
            password: 'admin',
        })

        const response = JSONResponse(jsonStatus.success, {user});
        res.status(httpCodes.Created).json(response);
        return;
    }
}

export default (db: db) => new AuthController(db);