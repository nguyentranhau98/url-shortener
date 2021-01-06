import { Router } from 'express';
import * as urlController from './urls.controllers';

const router = Router();

router.post('/', urlController.shortenUrl);
router.get('/:uniqueCode', urlController.getShortenUrl);

export default router;
