import express, { NextFunction, Request, Response } from 'express'
import userRouter from './routes/user'
import authRouter from './routes/auth'
import { AppSettings } from './appSettings';
import { authenticate } from './JWT';
import httpCodes from './enums/httpCodes';
import jsonStatus from './enums/jsonStatus';

function errorMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
    console.error(err); // Log the error for debugging purposes
  
    // Handle the error response
    res.status(httpCodes.InternalServerError).json({
      status: jsonStatus.error,
      message: err.message ?? 'Something went wrong',
    });
  }

export class App {
    public app: express.Application;
    public static tokenNotAllowedList: Set<string> = new Set();
    public settings: AppSettings;

    constructor(settings: AppSettings) {
        this.app = express();
        this.settings = settings;
        const app = this.app;

        app.use(express.json());

        app.use(errorMiddleware);
    

        app.use('/api/users', authenticate, userRouter);
        app.use('/', authRouter);

        // catch all error handler
    }

    public start = () => this.app.listen(this.settings.port, () => {
        console.log(`Server listening on port ${this.settings.port}`);
        console.log(`DB: ${this.settings.dbType}`)
    });
}

export default App;