import 'dotenv/config';
import { openKv } from '@deno/kv';
import { MongoClient } from 'mongodb';
import * as discordStrategy from './lib/strategy';
import { createApp } from './app';
import { BotService } from './services/bot';
import { UserGuildsService } from './services/guilds';

const PORT = process.env.PORT || 3001;

(async () => {
    let mongoClient: MongoClient | undefined;

    try {
        mongoClient = new MongoClient(process.env.MONGO_CONNECTION_URI);
        const passportUserKv = await openKv('temp/kv.db');

        // Create service instances
        const botService = new BotService();
        await botService.init();
        
        const userGuildsService = new UserGuildsService(botService);

        await discordStrategy.init(passportUserKv);
        const app = createApp({ botService, userGuildsService });

        app.listen(PORT, () => {
            console.log(`Listening on port ${PORT}`);
        });
    } finally {
        // Cleanup code
        if(mongoClient) mongoClient.close();
    }
})();
