import { Router } from 'express';
import passport from 'passport';
import type { PassportUser } from '@/lib/strategy';

const authRouter = Router();

authRouter.get('/discord', passport.authenticate('discord'), (req, res) => {
    res.send(200);
});

authRouter.get('/discord/redirect', passport.authenticate('discord'), (req, res) => {
    res.send({ msg: 'Success' });
});

authRouter.get('/', (req, res) => {
    const user = req.user as PassportUser;

    if(user) res.send(user);
    else res.status(401).send({ msg: 'Unauthorized' });
});

export default authRouter;
