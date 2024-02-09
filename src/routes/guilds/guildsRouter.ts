import { PassportUser } from '@/lib/strategy';
import { Services } from '@/types/services';
import { Router } from 'express';
import { isSignedIn } from '@/middlewares/isSignedIn';
import { ensurePermissions } from '@/middlewares/ensurePermissions';

export default (services: Services): Router => {
    const guildsRouter = Router();

    guildsRouter.use(isSignedIn());
    guildsRouter.use(ensurePermissions(services));

    guildsRouter.get('/mutual', async (req, res) => {
        let user = req.user as PassportUser;

        let serviceUser = services.userGuildsService.getUser(user.id, user.accessToken, user.refreshToken);
        let mutualGuilds = await serviceUser.getMutualGuilds({ skipCache: req.query.force === '1' });

        res.send({ message: 'success', data: mutualGuilds });
    });

    return guildsRouter;
};
