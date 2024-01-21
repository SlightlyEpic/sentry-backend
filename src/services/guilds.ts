import DiscordOAuth2 from 'discord-oauth2';
import type { Bot } from './bot';

type GuildInfo = {
    allowed?: boolean        // Does user have sufficient permissions to change settings in this guild
    icon: string
    name: string
    id: string
};

export class UserGuilds {
    userId: string;
    accessToken: string;
    refreshToken: string;
    bot: Bot;
    oauth: DiscordOAuth2;
    private mutualGuildsCache?: GuildInfo[];

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

    async getMutualGuilds(options?: { skipCache: boolean }): Promise<GuildInfo[]> {
        if(this.mutualGuildsCache && !options?.skipCache) return this.mutualGuildsCache;

        const userGuilds = await this.oauth.getUserGuilds(this.accessToken);
        const botGuilds = this.bot.getGuilds();

        let mutualGuilds = userGuilds
            .filter(guild => botGuilds.has(guild.id))
            .map(guild => {
                return {
                    icon: guild.icon,
                    id: guild.id,
                    name: guild.name
                } as GuildInfo;
            });

        this.mutualGuildsCache = mutualGuilds;
        return mutualGuilds;
    }
}
