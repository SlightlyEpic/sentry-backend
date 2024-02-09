import { PassportUser } from '@/lib/strategy';
import { Services } from '@/types/services';
import { RequestHandler } from 'express';
// import TTLCache from '@isaacs/ttlcache';

interface EnsurePermsRequestHandler extends RequestHandler<{ guildId?: string }> {}

export const ensurePermissions: (services: Services) => EnsurePermsRequestHandler = (services: Services) => {
    // Key: `${userId}-${guildId}`
    // const permsCache = new TTLCache<`${string}-${string}`, string[]>({
    //     max: 500,
    //     ttl: 2 * 60 * 1000
    // });

    return async (req, res, next) => {
        const user = req.user as PassportUser;
        if(!user) return res.status(403).send({ error: 'Not signed in.' });

        if(!req.params.guildId) {
            res.locals.memberPerms = {
                role: [],
                permit: []
            };
            next();
            return;
        }

        // const cacheKey = `${user.id}-${req.params.guildId}` as const;
        // if(permsCache.has(cacheKey)) {
        //     res.locals.memberPerms = permsCache.get(cacheKey);
        //     next();
        //     return;
        // }

        const serviceUser = services.userGuildsService.getUser(user.id, user.accessToken, user.refreshToken);

        try {
            const allPerms = await serviceUser.getAllPermissions(req.params.guildId);

            // Allow if, role permission has MANAGE_GUILD or ADMINISTRATOR
            // or if permit permission has FULL_CONTROL
            if(
                !allPerms.role.includes('ADMINISTRATOR') && 
                !allPerms.role.includes('MANAGE_GUILD') && 
                !allPerms.permit.includes('FULL_CONTROL')
            ) {
                res.status(403).send({ error: 'Insufficient permissions.' });
                return;
            }

            res.locals.memberPerms = allPerms;
            next();
        } catch(err) {
            res.status(500).send({ error: `${err}` });
        }
    };
};
