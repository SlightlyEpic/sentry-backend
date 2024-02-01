import { Guild } from '@/types/db';
import { Db, MongoClient, Collection, ObjectId } from 'mongodb';
import { UpdateBuilder } from './updateBuilder';

// CAUTION: This class will not validate permissions
// Make sure that users can only modify data which falls under their permissions
export class DbService {
    client: MongoClient;
    db: Db;
    collection: Collection<Guild>;

    constructor(client: MongoClient) {
        this.client = client;
        this.db = client.db('sentry');
        this.collection = this.db.collection<Guild>('guilds');
    }

    async getGuild(guildId: string): Promise<Guild> {
        const doc = await this.collection.findOne({ _id: new ObjectId(guildId) });
        if(!doc) throw Error('Guild document not found');
        
        return doc;
    }

    async update(guildId: string, builder: UpdateBuilder): Promise<void> {
        const filter = { _id: new ObjectId(guildId) };
        const query = builder.getQuery();
        this.collection.updateOne(filter, query);
    }
}

export { UpdateBuilder };
