import passport from 'passport';
import { Profile, Strategy } from 'passport-discord';
import { openKv } from '@deno/kv';

type PassportUser = {
    id: string
    accessToken: string
    refreshToken: string
};

export const init = async () => {
    const kv = await openKv('temp/kv.db');
    console.log('kv open');

    // I have no idea how to strong type user
    // See: https://stackoverflow.com/questions/65772869/how-do-i-type-hint-the-user-argument-when-calling-passport-serializeuser-in-type
    // The above does not work, I have dug through the library types and its beyond me

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    passport.serializeUser((user: any, done) => {
        return done(null, user.id);
    });

    passport.deserializeUser(async (id: string, done) => {
        const user = await kv.get<PassportUser>([id]);
        done(null, user.value);
    });

    passport.use(
        new Strategy({
            clientID: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
            callbackURL: process.env.DISCORD_REDIRECT_URL,
            scope: ['identify', 'guilds', 'guilds.members.read']
        },
        async (accessToken: string, refreshToken: string, profile: Profile, done) => {
            let user: PassportUser = {
                id: profile.id,
                accessToken,
                refreshToken,
            };

            let result = await kv.set([profile.id], user);
            if(!result.ok) {
                done(new Error(`kv failed to set ${profile.id}`), undefined);
                return;
            }

            done(null, user);
        })
    );
};
