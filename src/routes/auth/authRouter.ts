import { Router } from 'express';

const authRouter = Router();

authRouter.get('/', (req, res) => {
    res.send(200);
});

export default authRouter;
