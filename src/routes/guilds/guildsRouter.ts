import { PassportUser } from '@/lib/strategy';
import { Services } from '@/types/services';
import { Request, Router } from 'express';
import { isSignedIn } from '@/middlewares/isSignedIn';
import { ensurePermissions } from '@/middlewares/ensurePermissions';
import validator from 'validator';
import { Punishment } from '@/types/db';

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

    type GuildPathParams = { guildId: string };

    guildsRouter.get('/:guildId/', async (req, res) => {
        try {
            const data = await services.dbService.guild(req.params.guildId).allSettings();
            res.send({ message: 'success', data: data });
        } catch(err) {
            res.status(500).send({ error: `${err}` });
        }
    });

    interface SetPrefixRequest extends Request<GuildPathParams, any, { prefix: string }> {}
    const hasWhitespace = new RegExp(/\\s+/gm);
    guildsRouter.post('/:guildId/prefix/', async (req: SetPrefixRequest, res) => {
        try {
            const pfx = req.body.prefix;
            if(
                !validator.isAscii(pfx) ||
                validator.isEmpty(pfx) ||
                hasWhitespace.test(pfx)
            ) {
                res.status(400).send({ error: 'Invalid prefix.' });
                return;
            }

            const success = await services.dbService.guild(req.params.guildId).setPrefix(pfx);
            if(!success) res.status(500).send({ error: 'Database error.' });
            else res.status(200).send({ message: 'Success' });
        } catch(err) {
            res.status(500).send({ error: `${err}` });
        }
    });

    interface AddPunishmentRequest extends Request<GuildPathParams, any, Punishment> {}
    guildsRouter.post('/:guildId/punishments/add', async (req: AddPunishmentRequest, res) => {
        try {
            if(
                typeof req.body.warningsCount !== 'number' ||
                typeof req.body.duration_raw !== 'string' ||
                typeof req.body.duration !== 'number' ||
                typeof req.body.warningSeverity !== 'string' ||
                typeof req.body.action !== 'string'
            ) {
                res.status(400).send({ error: 'Data types do not match.' });
                return;
            }

            const success = await services.dbService.guild(req.params.guildId).addPunishment(req.body);
            if(!success) res.status(500).send({ error: 'Database error.' });
            else res.status(200).send({ message: 'Success' });
        } catch(err) {
            res.status(500).send({ error: `${err}` });
        }
    });

    interface RemovePunishmentRequest extends Request<GuildPathParams, any, Punishment> {}
    guildsRouter.post('/:guildId/punishments/remove', async (req: RemovePunishmentRequest, res) => {
        try {
            if(
                typeof req.body.warningsCount !== 'number' ||
                typeof req.body.duration_raw !== 'string' ||
                typeof req.body.duration !== 'number' ||
                typeof req.body.warningSeverity !== 'string' ||
                typeof req.body.action !== 'string'
            ) {
                res.status(400).send({ error: 'Data types do not match.' });
                return;
            }

            const success = await services.dbService.guild(req.params.guildId).removePunishment(req.body);
            if(!success) res.status(500).send({ error: 'Database error.' });
            else res.status(200).send({ message: 'Success' });
        } catch(err) {
            res.status(500).send({ error: `${err}` });
        }
    });

    return guildsRouter;
};
