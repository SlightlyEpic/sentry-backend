import DiscordOAuth2 from 'discord-oauth2';
import type { BotService } from './bot';
import { DbService } from './db/db';
import TTLCache from '@isaacs/ttlcache';
import { PermissionFlagsBits } from 'discord.js';

type GuildInfo = {
    allowed?: boolean        // Does user have sufficient permissions to change settings in this guild
    permissions?: string[]
    icon: string
    name: string
    id: string
};

export type CustomPermissions = {
    role: string[]
    permit: string[]
}

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

    getDiscordUser(accessToken: string) {
        return this.oauth.getUser(accessToken);
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
    private permissionsCache: TTLCache<string, string[]>;      // guildId -> permissions array

    constructor(userId: string, accessToken: string, refreshToken: string, dbService: DbService, botService: BotService, oauth: DiscordOAuth2) {
        this.userId = userId;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.permissionsCache = new TTLCache({ max: 10, ttl: 60 * 1000 });

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

    async getAllPermissions(guildId: string): Promise<CustomPermissions> {
        const allPerms = {
            role: [] as string[],
            permit: await this.getGuildPermissions(guildId)
        };

        const rolePerms = new Set<string>();
        const member = await this.getGuildMember(guildId);
        const memberRoles = member.roles;
        const guild = this.bot.getGuilds().get(guildId);
        if(guild?.ownerId && guild.ownerId === member.user?.id) rolePerms.add('ADMINISTRATOR');

        if(!guild) return allPerms;

        guild.roles.cache.forEach(role => {
            if(role.permissions.has(PermissionFlagsBits.Administrator) && memberRoles.includes(role.id)) {
                rolePerms.add('ADMINISTRATOR');
            }

            if(role.permissions.has(PermissionFlagsBits.ManageGuild) && memberRoles.includes(role.id)) {
                rolePerms.add('MANAGE_GUILD');
            }
        });

        allPerms.role = Array.from(rolePerms);

        return allPerms;
    }

    async getGuildPermissions(guildId: string, options?: { skipCache?: boolean }): Promise<string[]> {
        if(this.permissionsCache.has(guildId) && !options?.skipCache) {
            return this.permissionsCache.get(guildId)!;
        }

        let guild = this.db.guild(guildId);
        let permits = await guild.permits();

        if(!permits) throw Error('Failed to get permits.');

        let member = await this.getGuildMember(guildId);
        let permissions = new Set<string>();

        permits.custom_permits.forEach(p => {
            p.roles = p.roles.map(r => r.toString());
            p.users = p.users.map(u => u.toString());
        });

        console.log('Member roles:', member.roles);
        for(let permit of permits.custom_permits) {
            console.log(`Permit ${permit.name}: roles`, permit.roles);
            for(let permitRole of permit.roles) {
                if(member.roles.includes(permitRole)) {
                    permit.permissions.forEach(p => permissions.add(p));
                }
            }
        }

        let perArr = Array.from(permissions);

        this.permissionsCache.set(guildId, perArr);
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
