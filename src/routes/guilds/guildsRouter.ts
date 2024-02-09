import { PassportUser } from '@/lib/strategy';
import { Services } from '@/types/services';
import { Response, Router } from 'express';
import { isSignedIn } from '@/middlewares/isSignedIn';
import { ensurePermissions } from '@/middlewares/ensurePermissions';
import { CustomPermissions } from '@/services/guilds';

interface MemberPermResponse extends Response {
    locals: {
        memberPerms: CustomPermissions
    }
}

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

    guildsRouter.get('/:guildId/', async (req, res: MemberPermResponse) => {
        try {
            const data = await services.dbService.guild(req.params.guildId).allSettings();
            res.send({ message: 'success', data: data });
        } catch(err) {
            res.status(500).send({ error: `${err}` });
        }
    });

    return guildsRouter;
};
