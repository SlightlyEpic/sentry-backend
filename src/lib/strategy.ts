import passport from 'passport';
import { Profile, Strategy } from 'passport-discord';

export const init = () => {
    passport.use(
        new Strategy({
            clientID: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
            callbackURL: process.env.DISCORD_REDIRECT_URL,
            scope: ['identify', 'guilds', 'guilds.members.read']
        },
        async (accessToken: string, refreshToken: string, profile: Profile, cb) => {
            console.log('accessToken:', accessToken);
            console.log('refreshToken:', refreshToken);
            console.log('profile:', profile);
            // console.log('callback:', cb.name);
        })
    );
};
