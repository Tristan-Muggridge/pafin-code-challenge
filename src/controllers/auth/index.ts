import { Request, Response } from "express";
import { Buffer } from "buffer";
import db from "../../database/db";
import httpCodes from "../../enums/httpCodes";
import JSONResponse from "../../JsonResponse";
import jsonStatus from "../../enums/jsonStatus";

import { sign } from '../../JWT';
import { App } from "../../App";

interface AuthController {
    login(req: Request, res: Response): Promise<void>;
    logout(req: Request, res: Response): void;
    register(req: Request, res: Response): void;
    refresh(req: Request, res: Response): void; 
}

interface AuthStrategy {
    authenticate(db: db): Promise<string | null>;
}

class BasicAuthStrategy implements AuthStrategy {
    public username: string;
    public password: string;

    public async authenticate(db: db) {
        return await db.basicAuth(this.username, this.password);
    }

    constructor(req: Request) {
        const authHeaderBase64 = req.headers.authorization?.split(' ')[1] || '';
        const [username, password] = Buffer.from(authHeaderBase64, 'base64').toString().split(':');

        this.username = username;
        this.password = password;
    }
}

class AuthController implements AuthController {
    
    private db: db;

    constructor(db: db) {
        this.db = db;
    }

    public login = async (req: Request, res: Response) => {
        const strategy = new BasicAuthStrategy(req);
        const authenticated = await strategy.authenticate(this.db);
        
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
            res.status(httpCodes.BadRequest).json(JSONResponse(jsonStatus.fail, undefined, 'Unable to log out. Token is missing.'));
            return;
        }
        
        App.tokenNotAllowedList.add(token);
        res.status(httpCodes.Ok).send(JSONResponse(jsonStatus.success, undefined, {message: 'Logged out successfully'}));
        
        return;
    }

    public TEST_ONLY_create_admin_user = async (req: Request, res: Response) => {
        const created = await this.db.createUser({
            name: 'admin',
            email: 'admin',
            password: 'admin',
        })

        const response = JSONResponse(jsonStatus.success, {user: created});
        return res.status(httpCodes.Created).json(response);
    }
}

export default (db: db) => new AuthController(db);