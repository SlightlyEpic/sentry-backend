import { PassportUser } from '@/lib/strategy';
import { Services } from '@/types/services';
import { RequestHandler } from 'express';

// Too much type wrestling, I give up
// Maybe its not possible to extend the Request object without using interface merging
// consequently changing the definition throught the code, and not just in whatever
// routes use this middleware

// interface EnsurePermsRequestHandler extends RequestHandler<{ guildId?: string }> {}
// interface EnsurePermsRequest extends Request<{ guildId?: string }> {
//     memberPerms: CustomPermissions
// }

export const ensurePermissions: (services: Services) => RequestHandler = (services: Services) => {
    return async (req, res, next) => {
        const user = req.user as PassportUser;
        if(!user) return res.status(403).send({ error: 'Not signed in.' });

        if(!req.params.guildId) {
            // req.memberPerms = {
            //     role: [],
            //     permit: []
            // };
            next();
            return;
        }

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

            // req.memberPerms = allPerms;
            next();
        } catch(err) {
            res.status(500).send({ error: `${err}` });
        }
    };
};
