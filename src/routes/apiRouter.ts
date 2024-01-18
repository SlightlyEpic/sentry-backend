import { Router } from 'express';
import authRouter from './auth/authRouter';

const apiRouter = Router();

apiRouter.get('/auth', authRouter);

export default apiRouter;
