import express from 'express'
import userRouter from './routes/user'
import settings from './appSettings';

class App {
    public app: express.Application;

    constructor(port: number) {
        this.app = express();
        this.app.use(express.json());
        this.app.use('/api/users', userRouter);

        this.app.listen(port, () => {
            console.log(`Server listening on port ${port}`);
            console.log(`DB: ${settings.dbType}`)
        });
    }
}

export default (port: number) => new App(port);