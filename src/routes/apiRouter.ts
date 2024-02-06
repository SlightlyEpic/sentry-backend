import { Router } from 'express';
import authRouter from './auth/authRouter';
import dbRouter from './db/dbRouter';
import { Services } from '@/types/services';

export default (services: Services): Router => {
    const apiRouter = Router();

    apiRouter.use('/auth', authRouter(services));
    apiRouter.use('/db', dbRouter(services));
    
    return apiRouter;
};
