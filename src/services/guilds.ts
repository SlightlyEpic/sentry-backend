import DiscordOAuth2 from 'discord-oauth2';
import type { BotService } from './bot';
import { DbService } from './db/db';
import TTLCache from '@isaacs/ttlcache';

type GuildInfo = {
    allowed?: boolean        // Does user have sufficient permissions to change settings in this guild
    permissions?: string[]
    icon: string
    name: string
    id: string
};

export class UserGuildsService {
    users: Map<string, UserGuildManager>;
    dbService: DbService;
    botService: BotService;
    oauth: DiscordOAuth2;

    constructor(botService: BotService, dbService: DbService) {
        this.users = new Map();
        this.dbService = dbService;

        if(!botService.isInit) throw Error('Bot service must be initialized before being passed to UserGuilds constructor!');
        this.botService = botService;

        this.oauth = new DiscordOAuth2({
            clientId: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
            redirectUri: process.env.DISCORD_REDIRECT_URL,
        });
    }

    addUser(userId: string, accessToken: string, refreshToken: string): UserGuildManager {
        const user = new UserGuildManager(userId, accessToken, refreshToken, this.dbService, this.botService, this.oauth);
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
    db: DbService;
    oauth: DiscordOAuth2;
    private mutualGuildsCache?: GuildInfo[];
    private guildPermissionsCache: TTLCache<string, string[]>;      // guildId -> permissions array

    constructor(userId: string, accessToken: string, refreshToken: string, dbService: DbService, botService: BotService, oauth: DiscordOAuth2) {
        this.userId = userId;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.guildPermissionsCache = new TTLCache({ max: 10, ttl: 2 * 60 * 1000 });

        this.bot = botService;
        if(!this.bot.isInit) throw Error('Bot service must be initialized before being passed to UserGuilds constructor!');

        this.db = dbService;        
        this.oauth = oauth;
    }

    async getUserGuilds() {
        return this.oauth.getUserGuilds(this.accessToken);
    }

    async getGuildMember(guildId: string) {
        return this.oauth.getGuildMember(this.accessToken, guildId);
    }

    async getGuildPermissions(guildId: string, options?: { skipCache?: boolean }): Promise<string[]> {
        if(this.guildPermissionsCache.has(guildId) && !options?.skipCache) {
            return this.guildPermissionsCache.get(guildId)!;
        }

        let guild = this.db.guild(guildId);
        let permits = await guild.permits();

        if(!permits) throw Error('Failed to get permits.');

        let member = await this.getGuildMember(guildId);
        let permissions = new Set<string>();

        for(let permit of permits.custom_permits) {
            for(let permitRole of permit.roles) {
                if(member.roles.includes(permitRole)) {
                    permit.permissions.forEach(p => permissions.add(p));
                }
            }
        }

        let perArr = Array.from(permissions);

        this.guildPermissionsCache.set(guildId, perArr);
        return perArr;
    }

    async getMutualGuilds(options?: { skipCache?: boolean }): Promise<GuildInfo[]> {
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
