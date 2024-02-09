import 'dotenv/config';
import { openKv } from '@deno/kv';
import { MongoClient } from 'mongodb';
import * as discordStrategy from './lib/strategy';
import { createApp } from './app';
import { BotService } from './services/bot';
import { UserGuildsService } from './services/guilds';
import { DbService } from './services/db/db';

const PORT = process.env.PORT || 3001;

(async () => {
    let mongoClient: MongoClient | undefined;

    try {
        mongoClient = new MongoClient(process.env.MONGO_CONNECTION_URI);
        await mongoClient.connect();
        console.log('Mongo client connected');

        const passportUserKv = await openKv('temp/kv.db');

        // Create service instances
        const botService = new BotService();
        await botService.init();
        
        const dbService = new DbService(mongoClient);
        
        const userGuildsService = new UserGuildsService(botService, dbService);

        await discordStrategy.init(passportUserKv);
        const app = createApp({ botService, userGuildsService, dbService });

        app.listen(PORT, () => {
            console.log(`Listening on port ${PORT}`);
        });
    } catch(err) {
        console.error('Error in index:', err);
        if(mongoClient) mongoClient.close();
    }

    process.on('uncaughtException', async err => {
        console.log(`Uncaught Exception: ${err.message}`);
        if(mongoClient) await mongoClient.close();
        process.exit(1);
    });
})();
