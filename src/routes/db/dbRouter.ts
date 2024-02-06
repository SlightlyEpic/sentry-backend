import { PassportUser } from '@/lib/strategy';
import { Services } from '@/types/services';
import { Router } from 'express';

export default (services: Services): Router => {
    const dbRouter = Router();

    dbRouter.get('/data/:guildId', async (req, res) => {
        let user = req.user as PassportUser;

        if(!user) return res.status(403).send({ error: 'Unauthorized' });

        let userGuild = services.dbService.guild(req.params.guildId);
        console.log('new data req:', req.params.guildId, user.id);
        let data = await userGuild.data();

        res.send({ message: 'success', data: data });
    });

    return dbRouter;
};
