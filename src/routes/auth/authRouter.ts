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
        if(process.env.NODE_ENV === 'development') res.redirect(`${process.env.VITE_ORIGIN}/login`);
        else res.redirect(`${process.env.ORIGIN}/login`);
    });

    authRouter.get('/', async (req, res) => {
        const user = req.user as PassportUser;
        const discordUser = await services.userGuildsService.getDiscordUser(user.accessToken);

        if(user) {
            res.send({
                username: discordUser.username,
                image: `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}`
            });
        } else {
            res.status(401).send({ message: 'Unauthorized' });
        }
    });

    authRouter.get('/logout', async     (req, res) => {
        req.logout((err) => {
            if(err) res.status(500).send({ error: `${err}` });
            else res.send({ message: 'Success.' });
        });
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
