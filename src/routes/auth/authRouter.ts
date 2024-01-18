import { Router } from 'express';
import passport from 'passport';

const authRouter = Router();

authRouter.get('/discord', passport.authenticate('discord'), (req, res) => {
    res.send(200);
});

authRouter.get('/discord/redirect', passport.authenticate('discord'), (req, res) => {
    res.send({ msg: 'Success' });
});

export default authRouter;
