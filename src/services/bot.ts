import Discord, { GatewayIntentBits } from 'discord.js';

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

    destroy() {
        return this.client.destroy();
    }
}
