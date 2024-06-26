import { PassportUser } from '@/lib/strategy';
import { Services } from '@/types/services';
import { Request, Router } from 'express';
import { isSignedIn } from '@/middlewares/isSignedIn';
import { ensurePermissions as ensurePermissionsFactory } from '@/middlewares/ensurePermissions';
import validator from 'validator';
import { definitions as ajvSchema } from '@/ajvSchema/guildRoutes.json';
import { validateBody } from '@/middlewares/validateBody';
import * as GR from '@/types/payloads/guildRoutes';

type GuildPathParms = { guildId: string };
interface ReqWithBody<T> extends Request<GuildPathParms, any, T> {}

export default (services: Services): Router => {
    const guildsRouter = Router();

    guildsRouter.use(isSignedIn());
    // guildsRouter.use(ensurePermissions(services));
    const ensurePermissions = ensurePermissionsFactory(services);

    guildsRouter.get('/mutual', async (req, res) => {
        try {
            let user = req.user as PassportUser;

            let serviceUser = services.userGuildsService.getUser(user.id, user.accessToken, user.refreshToken);
            let mutualGuilds = await serviceUser.getMutualGuilds({ skipCache: req.query.force === '1' });

            res.send({ message: 'success', data: mutualGuilds });
        } catch(err) {
            res.status(500).send({ error: `${err}` });
        }
    });

    guildsRouter.get('/:guildId/', ensurePermissions, async (req, res) => {
        try {
            const allSettings = await services.dbService.guild(req.params.guildId).allSettings();
            const roleObj = services.botService.getAllRoles(req.params.guildId);
            
            if(!allSettings || !roleObj) {
                res.status(400).send({ error: 'Guild not found' });
                return;
            }

            const data = {
                ...allSettings,
                roles: roleObj
            };

            res.send({ message: 'success', data: data });
        } catch(err) {
            res.status(500).send({ error: `${err}` });
        }
    });
    
    guildsRouter.get('/:guildId/templates', ensurePermissions, async (req, res) => {
        try {
            const data = await services.dbService.guild(req.params.guildId).templates();
            res.send({ message: 'success', data: data });
        } catch(err) {
            res.status(500).send({ error: `${err}` });
        }
    });

    guildsRouter.get('/:guildId/applications', ensurePermissions, async (req, res) => {
        try {
            const data = await services.dbService.guild(req.params.guildId).applications();
            res.send({ message: 'success', data: data });
        } catch(err) {
            res.status(500).send({ error: `${err}` });
        }
    });

    /*****************************************************
     * General settings routes
     *****************************************************/

    const hasWhitespace = new RegExp(/\s/gm);
    guildsRouter.post('/:guildId/prefix/', ensurePermissions, validateBody(ajvSchema.SetPrefixPayload), async (req: ReqWithBody<GR.SetPrefixPayload>, res) => {
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

    guildsRouter.post('/:guildId/modstats/status', ensurePermissions, validateBody(ajvSchema.SetModStatsStatusPayload), async (req: ReqWithBody<GR.SetModStatsStatusPayload>, res) => {
        try {
            const success = await services.dbService.guild(req.params.guildId).setModStatsStatus(req.body.status);
            if(!success) res.status(500).send({ error: 'Database error.' });
            else res.status(200).send({ message: 'Success' });
        } catch(err) {
            res.status(500).send({ error: `${err}` });
        }
    });

    guildsRouter.post('/:guildId/compactResponse', ensurePermissions, validateBody(ajvSchema.SetCompactResponsePayload), async (req: ReqWithBody<GR.SetCompactResponsePayload>, res) => {
        try {
            const success = await services.dbService.guild(req.params.guildId).setCompactResponse(req.body.status);
            if(!success) res.status(500).send({ error: 'Database error.' });
            else res.status(200).send({ message: 'Success' });
        } catch(err) {
            res.status(500).send({ error: `${err}` });
        }
    });

    /*****************************************************
     * Punishment settings routes
     *****************************************************/

    guildsRouter.post('/:guildId/punishments/add', ensurePermissions, validateBody(ajvSchema.AddPunishmentPayload), async (req: ReqWithBody<GR.AddPunishmentPayload>, res) => {
        try {
            const success = await services.dbService.guild(req.params.guildId).addPunishment(req.body);
            if(!success) res.status(500).send({ error: 'Database error.' });
            else res.status(200).send({ message: 'Success' });
        } catch(err) {
            res.status(500).send({ error: `${err}` });
        }
    });

    guildsRouter.post('/:guildId/punishments/remove', ensurePermissions, validateBody(ajvSchema.RemovePunishmentPayload), async (req: ReqWithBody<GR.RemovePunishmentPayload>, res) => {
        try {
            const success = await services.dbService.guild(req.params.guildId).removePunishment(req.body);
            if(!success) res.status(500).send({ error: 'Database error.' });
            else res.status(200).send({ message: 'Success' });
        } catch(err) {
            res.status(500).send({ error: `${err}` });
        }
    });

    /*****************************************************
     * Custom permit setting routes
     *****************************************************/

    guildsRouter.post('/:guildId/permits/add', ensurePermissions, validateBody(ajvSchema.AddPermitPayload), async (req: ReqWithBody<GR.AddPermitPayload>, res) => {
        try {
            const success = await services.dbService.guild(req.params.guildId).addPermit(req.body);
            if(!success) res.status(500).send({ error: 'Database error.' });
            else res.status(200).send({ message: 'Success' });
        } catch(err) {
            res.status(500).send({ error: `${err}` });
        }
    });

    guildsRouter.post('/:guildId/permits/remove', ensurePermissions, validateBody(ajvSchema.RemovePermitPayload), async (req: ReqWithBody<GR.RemovePermitPayload>, res) => {
        try {
            const success = await services.dbService.guild(req.params.guildId).removePermit(req.body.permitName);
            if(!success) res.status(500).send({ error: 'Database error.' });
            else res.status(200).send({ message: 'Success' });
        } catch(err) {
            res.status(500).send({ error: `${err}` });
        }
    });

    guildsRouter.post('/:guildId/permits/permissions/', ensurePermissions, validateBody(ajvSchema.SetPermissionsPayload), async (req: ReqWithBody<GR.SetPermissionsPayload>, res) => {
        try {
            const success = await services.dbService.guild(req.params.guildId).setPermissions(req.body.permitName, req.body.permissions);
            if(!success) res.status(500).send({ error: 'Database error.' });
            else res.status(200).send({ message: 'Success' });
        } catch(err) {
            res.status(500).send({ error: `${err}` });
        }
    });

    guildsRouter.post('/:guildId/permits/roles/', ensurePermissions, validateBody(ajvSchema.SetRolesPayload), async (req: ReqWithBody<GR.SetRolesPayload>, res) => {
        try {
            const success = await services.dbService.guild(req.params.guildId).setRoles(req.body.permitName, req.body.roles);
            if(!success) res.status(500).send({ error: 'Database error.' });
            else res.status(200).send({ message: 'Success' });
        } catch(err) {
            res.status(500).send({ error: `${err}` });
        }
    });

    /*****************************************************
     * Advertisment warning settings routes
     *****************************************************/

    guildsRouter.post('/:guildId/adWarn/status/', ensurePermissions, validateBody(ajvSchema.SetAdwarnStatusPayload), async (req: ReqWithBody<GR.SetAdwarnStatusPayload>, res) => {
        try {
            const success = await services.dbService.guild(req.params.guildId).setAdwarnStatus(req.body.status);
            if(!success) res.status(500).send({ error: 'Database error.' });
            else res.status(200).send({ message: 'Success' });
        } catch(err) {
            res.status(500).send({ error: `${err}` });
        }
    });

    guildsRouter.post('/:guildId/adWarn/channel/', ensurePermissions, validateBody(ajvSchema.SetAdwarnChannelPayload), async (req: ReqWithBody<GR.SetAdwarnChannelPayload>, res) => {
        try {
            const success = await services.dbService.guild(req.params.guildId).setAdwarnChannel(req.body.channel);
            if(!success) res.status(500).send({ error: 'Database error.' });
            else res.status(200).send({ message: 'Success' });
        } catch(err) {
            res.status(500).send({ error: `${err}` });
        }
    });

    guildsRouter.post('/:guildId/adWarn/dmStatus/', ensurePermissions, validateBody(ajvSchema.SetAdwarnDmStatusPayload), async (req: ReqWithBody<GR.SetAdwarnDmStatusPayload>, res) => {
        try {
            const success = await services.dbService.guild(req.params.guildId).setAdwarnDmStatus(req.body.status);
            if(!success) res.status(500).send({ error: 'Database error.' });
            else res.status(200).send({ message: 'Success' });
        } catch(err) {
            res.status(500).send({ error: `${err}` });
        }
    });

    guildsRouter.post('/:guildId/adWarn/message/', ensurePermissions, validateBody(ajvSchema.SetAdwarnMessagePayload), async (req: ReqWithBody<GR.SetAdwarnMessagePayload>, res) => {
        try {
            const success = await services.dbService.guild(req.params.guildId).setAdwarnMessage(req.body.message);
            if(!success) res.status(500).send({ error: 'Database error.' });
            else res.status(200).send({ message: 'Success' });
        } catch(err) {
            res.status(500).send({ error: `${err}` });
        }
    });

    /*****************************************************
     * Reports settings routes
     *****************************************************/

    guildsRouter.post('/:guildId/reports/status/', ensurePermissions, validateBody(ajvSchema.SetReportStatusPayload), async (req: ReqWithBody<GR.SetReportStatusPayload>, res) => {
        try {
            const success = await services.dbService.guild(req.params.guildId).setReportsStatus(req.body.status);
            if(!success) res.status(500).send({ error: 'Database error.' });
            else res.status(200).send({ message: 'Success' });
        } catch(err) {
            res.status(500).send({ error: `${err}` });
        }
    });

    guildsRouter.post('/:guildId/reports/channel/', ensurePermissions, validateBody(ajvSchema.SetReportsChannelPayload), async (req: ReqWithBody<GR.SetReportsChannelPayload>, res) => {
        try {
            const success = await services.dbService.guild(req.params.guildId).setReportsChannel(req.body.channel);
            if(!success) res.status(500).send({ error: 'Database error.' });
            else res.status(200).send({ message: 'Success' });
        } catch(err) {
            res.status(500).send({ error: `${err}` });
        }
    });

    /*****************************************************
     * Template settings routes
     *****************************************************/

    guildsRouter.post('/:guildId/templates/update', ensurePermissions, validateBody(ajvSchema.SetMessageTemplatePayload), async (req: ReqWithBody<GR.SetMessageTemplatePayload>, res) => {
        try {
            const success = await services.dbService.guild(req.params.guildId).setMessageTemplate(req.body);
            if(!success) res.status(500).send({ error: 'Database error.' });
            else res.status(200).send({ message: 'Success' });
        } catch(err) {
            res.status(500).send({ error: `${err}` });
        }
    });

    return guildsRouter;
};
