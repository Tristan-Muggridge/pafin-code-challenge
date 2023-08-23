import express, { NextFunction, Request, Response, Application } from 'express'
require('express-async-errors')
import cors from 'cors'

import userRouter from './routes/user'
import authRouter from './routes/auth'
import { AppSettings } from './appSettings';
import { authenticate } from './JWT';
import httpCodes from './enums/httpCodes';
import jsonStatus from './enums/jsonStatus';
import JsonResponse from './JsonResponse'

function errorMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
	// Log the error for debugging purposes
	console.error(err);

	// Handle the error response
	res.status(httpCodes.InternalServerError).json(JsonResponse(jsonStatus.fail, null, {message: err.message}));
}

export class App {
	// Keep a list of tokens that are not allowed to be used anymore (ie: logged out)
	// ** Ideally this would be in a table but challenge requirements specified single User table **
	public static tokenNotAllowedList: Set<string> = new Set();
    public static settings: AppSettings;

	public app: Application;

    constructor(settings: AppSettings) {
		App.settings = settings;

        this.app = express();
        
		// For convenience
		const app = this.app; 

		// Allow cross origin requests
		app.use(cors());

		// Need this to parse the body of POST requests
        app.use(express.json());
		
		// Protect all of our user routes with JWT authentication
        app.use('/api/users', authenticate, userRouter);

		// Allow unauthenticated users to access the auth routes for logging in and registering
        app.use('/', authRouter);
	
		// Handle errors ( Async errors included thanks to express-async-errors )
		app.use(errorMiddleware);
	}

    public start = () => this.app.listen(App.settings.port, () => {
        console.log(`Server listening on port ${App.settings.port}`);
        console.log(`DB: ${App.settings.dbType}`)
    });
}

export default App;