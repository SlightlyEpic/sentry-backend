import { Guild, Message, Permit, Punishment } from '@/types/db';
import { Collection, Filter, ObjectId, UpdateFilter } from 'mongodb';

export class GuildManager {
    guildId: string;
    collection: Collection<Guild>;
    filter: Filter<Guild>;

    constructor(guildId: string, collection: Collection<Guild>) {
        this.guildId = guildId;
        this.collection = collection;
        this.filter = { _id: new ObjectId(guildId) };
    }

    async data(): Promise<Guild> {
        const doc = await this.collection.findOne(this.filter);
        if(!doc) throw Error('Guild document not found');
        
        return doc;
    }

    /***************************************************
     **************** General settings *****************
     ***************************************************/

    async setPrefix(prefix: string) {
        const query: UpdateFilter<Guild> = {
            $set: {
                'prefix': prefix
            }
        };

        let result = await this.collection.updateOne(this.filter, query);
        if(result.modifiedCount) return true;
        else return false;
    }

    /***************************************************
     *************** Punishment settings ***************
     ***************************************************/

    async addPunishment(punishment: Punishment) {
        const query: UpdateFilter<Guild> = {
            $push: {
                'warn_punishments': punishment
            }
        };

        let result = await this.collection.updateOne(this.filter, query);
        if(result.modifiedCount) return true;
        else return false;
    }

    // Since Punishment has no unique identifier for some reason
    // It will have to be a complete match to be removed
    async removePunishment(punishment: Punishment) {
        const query: UpdateFilter<Guild> = {
            $pullAll: {
                'warn_punishments': [punishment]
            }
        };

        let result = await this.collection.updateOne(this.filter, query);
        if(result.modifiedCount) return true;
        else return false;
    }

    /***************************************************
     ***************** Permit settings *****************
     ***************************************************/
    
    async addPermit(permit: Permit) {
        const query: UpdateFilter<Guild> = {
            $push: {
                'custom_permits': permit
            }
        };

        let result = await this.collection.updateOne(this.filter, query);
        if(result.modifiedCount) return true;
        else return false;
    }

    async removePermit(permitName: string) {
        const query: UpdateFilter<Guild> = {
            $pull: {
                'custom_permits': {
                    name: permitName
                }
            }
        };

        let result = await this.collection.updateOne(this.filter, query);
        if(result.modifiedCount) return true;
        else return false;
    }

    /**@todo */
    async setPermissions(permitIndex: number, permissions: string[]) {
        
    }

    /**@todo */
    async setRoles(permitIndex: number, roles: string[]) {

    }

    /***************************************************
     ********** Advertisment Warning settings **********
     ***************************************************/

    async setAdwarnStatus(status: boolean) {
        const query: UpdateFilter<Guild> = {
            $set: {
                'adwarning_settings.status': status
            }
        };

        let result = await this.collection.updateOne(this.filter, query);
        if(result.modifiedCount) return true;
        else return false;
    }

    async setAdwarnChannel(channel: string) {
        const query: UpdateFilter<Guild> = {
            $set: {
                'adwarning_settings.channel': channel
            }
        };

        let result = await this.collection.updateOne(this.filter, query);
        if(result.modifiedCount) return true;
        else return false;
    }

    async setAdwarnDmStatus(status: boolean) {
        const query: UpdateFilter<Guild> = {
            $set: {
                'adwarning_settings.send_dm': status
            }
        };

        let result = await this.collection.updateOne(this.filter, query);
        if(result.modifiedCount) return true;
        else return false;
    }

    async setAdwarnMessage(message: Message | null) {
        const query: UpdateFilter<Guild> = {
            $set: {
                'adwarning_settings.message_template': message
            }
        };

        let result = await this.collection.updateOne(this.filter, query);
        if(result.modifiedCount) return true;
        else return false;
    }

    /***************************************************
     ***************** Report settings *****************
     ***************************************************/

    async setReportsStatus(status: boolean) {
        const query: UpdateFilter<Guild> = {
            $set: {
                'reports.status': status
            }
        };

        let result = await this.collection.updateOne(this.filter, query);
        if(result.modifiedCount) return true;
        else return false;
    }

    async setReportsChannel(channel: string) {
        const query: UpdateFilter<Guild> = {
            $set: {
                'reports.channel': channel
            }
        };

        let result = await this.collection.updateOne(this.filter, query);
        if(result.modifiedCount) return true;
        else return false;
    }
}