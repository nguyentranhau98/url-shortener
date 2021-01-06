import { Router } from 'express';
import urlRouter from '../src/urls/urls.routes';

const router = Router();

router.use('/shorten-url', urlRouter);

export default router;
