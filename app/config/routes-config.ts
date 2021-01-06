import {Express, Request, Response} from 'express';

export default (app: Express) => {
  app.get('/', (req: Request, res: Response) => res.send('Express + TypeScript Server'));
  app.use('*', (req: Request, res: Response) => {
    return res.status(404).json({
      message: 'Not found',
    });
  });
};
