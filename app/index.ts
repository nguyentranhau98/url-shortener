import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import routesConfig from './config/routes-config';
import { connectDB } from './database/connection';

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
app.use(helmet());

connectDB();
routesConfig(app);

export default app;

