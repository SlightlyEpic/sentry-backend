import { PassportUser } from '@/lib/strategy';
import { Services } from '@/types/services';
import { Request, Router } from 'express';
import { isSignedIn } from '@/middlewares/isSignedIn';
import { ensurePermissions } from '@/middlewares/ensurePermissions';
import validator from 'validator';
import { definitions as ajvSchema } from '@/ajvSchema/guildRoutes.json';
import { validateBody } from '@/middlewares/validateBody';
import * as GR from '@/types/payloads/guildRoutes';

type GuildPathParms = { guildId: string };
interface ReqWithBody<T> extends Request<GuildPathParms, any, T> {}

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

    guildsRouter.get('/:guildId/', async (req, res) => {
        try {
            const data = await services.dbService.guild(req.params.guildId).allSettings();
            res.send({ message: 'success', data: data });
        } catch(err) {
            res.status(500).send({ error: `${err}` });
        }
    });

    const hasWhitespace = new RegExp(/\s/gm);
    guildsRouter.post('/:guildId/prefix/', validateBody(ajvSchema.SetPrefixPayload), async (req: ReqWithBody<GR.SetPrefixPayload>, res) => {
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

    guildsRouter.post('/:guildId/punishments/add', validateBody(ajvSchema.AddPunishmentPayload), async (req: ReqWithBody<GR.AddPunishmentPayload>, res) => {
        try {
            const success = await services.dbService.guild(req.params.guildId).addPunishment(req.body);
            if(!success) res.status(500).send({ error: 'Database error.' });
            else res.status(200).send({ message: 'Success' });
        } catch(err) {
            res.status(500).send({ error: `${err}` });
        }
    });

    guildsRouter.post('/:guildId/punishments/remove', validateBody(ajvSchema.RemovePunishmentPayload), async (req: ReqWithBody<GR.RemovePunishmentPayload>, res) => {
        try {
            const success = await services.dbService.guild(req.params.guildId).removePunishment(req.body);
            if(!success) res.status(500).send({ error: 'Database error.' });
            else res.status(200).send({ message: 'Success' });
        } catch(err) {
            res.status(500).send({ error: `${err}` });
        }
    });

    guildsRouter.post('/:guildId/permits/add', validateBody(ajvSchema.AddPermitPayload), async (req: ReqWithBody<GR.AddPermitPayload>, res) => {
        try {
            const success = await services.dbService.guild(req.params.guildId).addPermit(req.body);
            if(!success) res.status(500).send({ error: 'Database error.' });
            else res.status(200).send({ message: 'Success' });
        } catch(err) {
            res.status(500).send({ error: `${err}` });
        }
    });

    guildsRouter.post('/:guildId/permits/remove', validateBody(ajvSchema.RemovePermitPayload), async (req: ReqWithBody<GR.RemovePermitPayload>, res) => {
        try {
            const success = await services.dbService.guild(req.params.guildId).removePermit(req.body.permitName);
            if(!success) res.status(500).send({ error: 'Database error.' });
            else res.status(200).send({ message: 'Success' });
        } catch(err) {
            res.status(500).send({ error: `${err}` });
        }
    });

    return guildsRouter;
};
