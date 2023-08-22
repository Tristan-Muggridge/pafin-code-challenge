import { Request, Response } from "express";
import IDB, { UserCreate, UserSelect } from "../../database/db";

import httpCodes from "../../enums/httpCodes";
import status from "../../enums/jsonStatus";
import JSONResponse from "../../JsonResponse";

import UserValidation from "./UserValidation";

enum ErrorMessages {
    NoId = "No user id provided in url parameters.",
    UserNotFound = "User not found.",
}

type ResponseObj = {
    [status.success]: Array<UserSelect>
    [status.fail]: {
        [email: string]: {
            name?: string[]
            email?: string[] | string
            password?: string[]
        }
    }
} 

export default async (req: Request, res: Response, db: IDB) => {                
    const users = req.body as UserCreate[];
    
    // default our response object with success and failures
    const responseObj: ResponseObj = { [status.success]: [], [status.fail]: {} };
    
    // going to user an email:user map to keep track of which users are valid
    const validatedUsers: Map<string, UserCreate> = new Map();

    // for each array entry, validate the contents
    users.forEach( (user, index) => {
        const validation = UserValidation(user);
        console.debug("email: ", user.email ?? index)

        // append any failed validations to the response object, use the index as the key if no email is provided
        if (!validation.valid) {
            responseObj[status.fail][user.email ?? index] = {
                name: validation.name.messages,
                email: validation.email.messages,
                password: validation.password.messages,
            };

            // early exit if the user is invalid
            return;
        }

        validatedUsers.set(user.email, user);
    });
    
    const emailUniqueness = await db.validateManyEmailUniqueness(validatedUsers);
    
    // Getting a batch ready to send to the database instead of one at a time
    const usersToCreate: Array<UserCreate> = [];

    validatedUsers.forEach( (user, email) => {
        emailUniqueness.get(email)?.unique 
            ? usersToCreate.push(user) 
            : responseObj[status.fail][email] = {email: "Email already exists."};
    });

    const createdUsers = await db.createUsers(usersToCreate);

    responseObj[status.success] = createdUsers;


    const response = JSONResponse(responseObj[status.fail] ? status.fail : status.success, {...responseObj});
    return res.status(httpCodes.Created).json({...response});
}