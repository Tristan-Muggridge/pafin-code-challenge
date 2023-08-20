import jwt from 'jsonwebtoken';
import settings from './appSettings';
import { NextFunction, Request, Response } from 'express';
import httpCodes from './enums/httpCodes';
import { App } from './App';
import JSONResponse from './JsonResponse';
import jsonStatus from './enums/jsonStatus';
export interface JwtPayload {
    userId: string
}

const jwtSecret = settings.jwtSecret;

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1] || '';

    if (!token) {
        res.status(httpCodes.Unauthorized).json(new JSONResponse(jsonStatus.fail, undefined, 'No token provided'));
        return;
    }

    if (App.tokenNotAllowedList.has(token)) {
        res.status(httpCodes.Unauthorized).send('Token not allowed');
    }

    let verification: string | jwt.JwtPayload;

    try {
        verification = verify(token);
    } catch (error) {
        res.status(httpCodes.Unauthorized).send(new JSONResponse(jsonStatus.fail, undefined, 'Invalid token'));
        return;
    }

    if (!verification) {
        res.status(httpCodes.Unauthorized).send('Invalid token');
        return;
    }

    next();
}

export const sign = (payload: JwtPayload) => jwt.sign(payload, jwtSecret, {
    expiresIn: '1h'
});

export const verify = (token: string) => jwt.verify(token, jwtSecret);