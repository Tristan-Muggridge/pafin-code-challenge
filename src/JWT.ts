import jwt from 'jsonwebtoken';
import settings from './appSettings';
import { NextFunction, Request, Response } from 'express';
import httpCodes from './enums/httpCodes';
import { App } from './app';

export interface JwtPayload {
    userId: string
}

const jwtSecret = settings.jwtSecret;

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1] || '';

    if (!token) {
        res.status(httpCodes.Unauthorized).send('No token provided');
        return;
    }

    if (App.tokenNotAllowedList.has(token)) {
        res.status(httpCodes.Unauthorized).send('Token not allowed');
    }

    const verification = jwt.verify(token, jwtSecret);

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