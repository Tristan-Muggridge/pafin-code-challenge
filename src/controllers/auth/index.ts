import { Request, Response } from "express";
import db from "../../database/db";

import httpCodes from "../../enums/httpCodes";
import JSONResponse from "../../JsonResponse";
import jsonStatus from "../../enums/jsonStatus";

import { sign, verify } from '../../JWT';
import { App } from "../../App";
import { BasicAuthStrategy } from "../../classes/AuthStrategies";

interface IAuthController {
    login(req: Request, res: Response): Promise<void>;
    logout(req: Request, res: Response): void;
}

enum Messages {
    InvalidCredentials = 'Invalid credentials',
    NoToken = 'No token provided, unable to logout',
    Success = 'Logged out successfully'
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
            const response = JSONResponse(jsonStatus.fail, undefined, {message: Messages.InvalidCredentials});
            res.status(httpCodes.Unauthorized).json(response);
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
            const response = JSONResponse(jsonStatus.fail, undefined, {message: Messages.NoToken})
            res.status(httpCodes.BadRequest).json(response);
            return;
        }
        
        // ensure the JWT token is valid
        const verification = verify(token);

        App.tokenNotAllowedList.add(token);

        const response = JSONResponse(jsonStatus.success, undefined, {message: Messages.Success})
        res.status(httpCodes.Ok).send(response);
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