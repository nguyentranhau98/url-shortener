import express from 'express';
import { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import routesConfig from './config/routes-config';
import { connectDB } from './database/connection';

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(helmet());
connectDB();

app.get('/', (req: Request, res: Response) =>
    res.send('Express + TypeScript Server'),
);
app.use('/api/v1', routesConfig);
app.use('*', (req: Request, res: Response) => {
    return res.status(404).json({
        message: 'Not found',
    });
});

export default app;
