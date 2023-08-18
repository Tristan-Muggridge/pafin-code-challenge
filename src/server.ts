import express, {Request, Response, NextFunction} from 'express'

import userRouter from './routes/user'

const app = express();
const port = 3000;

app.use('/api/user', userRouter);

app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});