import DiscordOAuth2 from 'discord-oauth2';
import type { Bot } from './bot';

type GuildInfo = {
    allowed?: boolean        // Does user have sufficient permissions to change settings in this guild
    image: string
    name: string
    id: string
};

export class UserGuilds {
    userId: string;
    accessToken: string;
    refreshToken: string;
    bot: Bot;
    oauth: DiscordOAuth2;
    private mutualGuilds?: GuildInfo[];

    constructor(userId: string, accessToken: string, refreshToken: string, botService: Bot) {
        this.userId = userId;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;

        this.bot = botService;
        if(!this.bot.isInit) throw Error('Bot service must be initialized before being passed to UserGuilds constructor!');
        
        this.oauth = new DiscordOAuth2({
            clientId: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
            redirectUri: process.env.DISCORD_REDIRECT_URL,
        });
    }

    async getUserGuilds() {
        return this.oauth.getUserGuilds(this.accessToken);
    }

    async getGuildMember(guildId: string) {
        return this.oauth.getGuildMember(this.accessToken, guildId);
    }

    async getMutualGuilds(): Promise<GuildInfo[]> {
        if(this.mutualGuilds) return this.mutualGuilds;
        else return this.forceGetMutualGuilds();
    }

    async forceGetMutualGuilds(): Promise<GuildInfo[]> {
        const userGuilds = this.oauth.getUserGuilds(this.accessToken);
        const botGuilds = this.bot.getGuilds();

        return [];
    }
}
