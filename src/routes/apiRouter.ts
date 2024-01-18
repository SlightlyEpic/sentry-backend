import { Router } from 'express';
import authRouter from './auth/authRouter';

const apiRouter = Router();

apiRouter.use('/auth', authRouter);

export default apiRouter;
