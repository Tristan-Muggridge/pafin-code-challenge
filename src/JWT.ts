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

enum ErrorMessages {
    NoToken = 'No token provided',
    TokenNotAllowed = 'Token not allowed',
    Invalid = 'Invalid token'
};

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1] || '';

    if (!token) {
        const response = JSONResponse(jsonStatus.fail, undefined, {message: ErrorMessages.NoToken})
        res.status(httpCodes.Unauthorized).json(response);
        return;
    }

    if (App.tokenNotAllowedList.has(token)) {
        const response = JSONResponse(jsonStatus.fail, undefined, {message: ErrorMessages.TokenNotAllowed});
        res.status(httpCodes.Unauthorized).send(response);
    }

    let verification: string | jwt.JwtPayload;

    try {
        verification = verify(token);
    } catch (error) {
        const response = JSONResponse(jsonStatus.fail, undefined, {message: ErrorMessages.Invalid})
        res.status(httpCodes.Unauthorized).send(response);
        return;
    }

    if (!verification) {
        const response = JSONResponse(jsonStatus.fail, undefined, {message: ErrorMessages.Invalid})
        res.status(httpCodes.Unauthorized).send(response);
        return;
    }

    next();
}

export const sign = (payload: JwtPayload) => jwt.sign(payload, jwtSecret, {
    expiresIn: '1h'
});

export const verify = (token: string) => jwt.verify(token, jwtSecret);