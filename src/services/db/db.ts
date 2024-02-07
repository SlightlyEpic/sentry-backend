import { Guild } from '@/types/db';
import { Db, MongoClient, Collection } from 'mongodb';
import { GuildManager } from './guildManager';

// CAUTION: This class will not validate permissions
// Make sure that users can only modify data which falls under their permissions
export class DbService {
    client: MongoClient;
    db: Db;
    guildCollection: Collection<Guild>;

    constructor(client: MongoClient) {
        this.client = client;
        this.db = client.db('sentry');
        this.guildCollection = this.db.collection<Guild>('guilds');
    }

    guild(guildId: string): GuildManager {
        return new GuildManager(guildId, this.guildCollection);
    }
}
