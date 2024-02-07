import { RequestHandler } from 'express';

export const isSignedIn: RequestHandler = (req, res, next) => {
    if(!req.user) return res.status(403).send({ error: 'Not signed in' });
    else next();
};

