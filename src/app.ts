import express from 'express'
import userRouter from './routes/user'
import authRouter from './routes/auth'
import settings from './appSettings';
import { authenticate } from './JWT';

export class App {
    public app: express.Application;
    public static tokenNotAllowedList: Set<string> = new Set();

    constructor(port: number) {
        this.app = express();
        const app = this.app;

        app.use(express.json());

        app.use('/api/users', authenticate, userRouter);
        app.use('/', authRouter);

        app.listen(port, () => {
            console.log(`Server listening on port ${port}`);
            console.log(`DB: ${settings.dbType}`)
        });
    }
}

const ApplicationStart = (port: number) => new App(port);
export default ApplicationStart;