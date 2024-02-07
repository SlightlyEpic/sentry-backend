import { Router } from 'express';
import authRouter from './auth/authRouter';
import guildsRouter from './guilds/guildsRouter';
import { Services } from '@/types/services';

export default (services: Services): Router => {
    const apiRouter = Router();

    apiRouter.use('/auth', authRouter(services));
    apiRouter.use('/guilds', guildsRouter(services));
    
    return apiRouter;
};
