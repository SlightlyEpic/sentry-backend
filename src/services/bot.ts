import Discord, { GatewayIntentBits } from 'discord.js';
import type { CompactRole } from '@/types/services';

export class BotService {
    private client: Discord.Client;
    isInit: boolean;

    constructor() {
        this.isInit = false;
        this.client = new Discord.Client({
            intents: [GatewayIntentBits.Guilds]
        });
    }

    init() {
        this.isInit = true;
        return new Promise<void>((resolve, reject) => {
            this.client.once('ready', () => resolve());

            this.client.login(process.env.DISCORD_TOKEN)
                .catch(reject);
        });
    }

    getGuilds() {
        return this.client.guilds.cache;
    }

    getAllRoles(guildId: string): { [key: string]: CompactRole } | null {
        const guild = this.client.guilds.cache.get(guildId);
        return guild ? Object.fromEntries(guild.roles.cache.mapValues((r): CompactRole => {
            return { id: r.id, name: r.name, color: r.color };
        })) : null;
    }

    destroy() {
        return this.client.destroy();
    }
}
