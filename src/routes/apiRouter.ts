import { Router } from 'express';
import authRouter from './auth/authRouter';
import guildsRouter from './guilds/guildsRouter';
import { Services } from '@/types/services';
import { rateLimit } from '@/middlewares/ratelimit';

export default (services: Services): Router => {
    const apiRouter = Router();

    apiRouter.use(rateLimit());

    apiRouter.use('/auth', authRouter(services));
    apiRouter.use('/guilds', guildsRouter(services));
    
    return apiRouter;
};
