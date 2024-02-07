import DiscordOAuth2 from 'discord-oauth2';
import type { BotService } from './bot';

type GuildInfo = {
    allowed?: boolean        // Does user have sufficient permissions to change settings in this guild
    icon: string
    name: string
    id: string
};

export class UserGuildsService {
    users: Map<string, UserGuildManager>;
    botService: BotService;
    oauth: DiscordOAuth2;

    constructor(botService: BotService) {
        this.users = new Map();

        if(!botService.isInit) throw Error('Bot service must be initialized before being passed to UserGuilds constructor!');
        this.botService = botService;

        this.oauth = new DiscordOAuth2({
            clientId: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
            redirectUri: process.env.DISCORD_REDIRECT_URL,
        });
    }

    addUser(userId: string, accessToken: string, refreshToken: string): UserGuildManager {
        const user = new UserGuildManager(userId, accessToken, refreshToken, this.botService, this.oauth);
        this.users.set(userId, user);
        return user;
    }
    
    getUser(userId: string, accessToken: string, refrehToken: string): UserGuildManager {
        return this.users.get(userId) || this.addUser(userId, accessToken, refrehToken);
    }

    removeUser(userId: string): boolean {
        return this.users.delete(userId);
    }
}

export class UserGuildManager {
    userId: string;
    accessToken: string;
    refreshToken: string;
    bot: BotService;
    oauth: DiscordOAuth2;
    private mutualGuildsCache?: GuildInfo[];

    constructor(userId: string, accessToken: string, refreshToken: string, botService: BotService, oauth: DiscordOAuth2) {
        this.userId = userId;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;

        this.bot = botService;
        if(!this.bot.isInit) throw Error('Bot service must be initialized before being passed to UserGuilds constructor!');
        
        this.oauth = oauth;
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

        console.log('userGuilds:', userGuilds);
        console.log('\n\nbotGuilds:', botGuilds);

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
