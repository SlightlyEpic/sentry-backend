import { Router } from 'express';
import passport from 'passport';
import type { PassportUser } from '@/lib/strategy';
import { Services } from '@/types/services';

export default (services: Services): Router => {
    const authRouter = Router();

    authRouter.get('/discord', passport.authenticate('discord'), (req, res) => {
        res.send(200);
    });

    authRouter.get('/discord/redirect', passport.authenticate('discord'), (req, res) => {
        res.send({ message: 'Success' });
    });

    authRouter.get('/', (req, res) => {
        const user = req.user as PassportUser;

        if(user) res.send(user);
        else res.status(401).send({ message: 'Unauthorized' });
    });

    authRouter.get('/mutual', async (req, res) => {
        const user = req.user as PassportUser;

        if(!user) res.status(401).send({ message: 'Unauthorized' });

        let userGuilds = services.userGuildsService.addUser(user.id, user.accessToken, user.refreshToken);
        let guilds = await userGuilds?.getMutualGuilds({ skipCache: true });

        // console.log('userGuilds:', userGuilds);
        // console.log('guilds:', guilds);

        res.send({ message: 'Success', result: guilds });
    });

    return authRouter;
};
