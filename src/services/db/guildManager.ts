import { Guild, Message, Permit, Punishment } from '@/types/db';
import { Collection, Filter, Long, UpdateFilter } from 'mongodb';

// ! IMPORTANT
// All Long values are sent as is from here
// They are stringified using JSON.stringify() by express,
// A .toJSON() method is added to Long's prototype in index.js
// Which makes the stringification return a string instead of { high: number, low: number, unsigned: boolean }
// When recieiving data for setters, it will convert all values that should be Long back into a Long
// Because they are recieved as strings (what they should have been smh)
// So anywhere you see x = x.map(v => new Long(v)) as unknown as string[]
// It is because IDs are stored as Longs in the db but sent as strings to the frontend

export class GuildManager {
    guildId: string;
    collection: Collection<Guild>;
    filter: Filter<Guild>;

    constructor(guildId: string, collection: Collection<Guild>) {
        this.guildId = guildId;
        this.collection = collection;
        this.filter = { _id: new Long(guildId) };
    }

    async data(): Promise<Guild | null> {
        const data = await this.collection.findOne(this.filter);
        // @ts-expect-error Because the guy decided to have "enabled"/"disabled" in the status field
        if(data) data.mod_stats.status = data.mod_stats.status === 'enabled';
        return data;
    }

    /***************************************************
     **************** General settings *****************
     ***************************************************/

    prefix() {
        type returnType = Pick<Guild, 'prefix'>;

        return this.collection.findOne<returnType>(this.filter, {
            projection: {
                'prefix': 1
            }
        });
    }

    async setPrefix(prefix: string) {
        const query: UpdateFilter<Guild> = {
            $set: {
                'prefix': prefix
            }
        };

        const result = await this.collection.updateOne(this.filter, query);
        if(result.matchedCount) return true;
        else return false;
    }

    async setModStatsStatus(status: boolean) {
        const query: UpdateFilter<Guild> = {
            $set: {
                'mod_stats.status': status ? 'enabled' : 'disabled'     // Because that guy decided to use enabled/disabled for this :|
            }
        };

        const result = await this.collection.updateOne(this.filter, query);
        if(result.matchedCount) return true;
        else return false;
    }

    async setCompactResponse(status: boolean) {
        const query: UpdateFilter<Guild> = {
            $set: {
                'compact_responses': status
            }
        };

        const result = await this.collection.updateOne(this.filter, query);
        if(result.matchedCount) return true;
        else return false;
    }

    /***************************************************
     *************** Punishment settings ***************
     ***************************************************/

    punishments() {
        type returnType = Pick<Guild, 'warn_punishments'>;

        return this.collection.findOne<returnType>(this.filter, {
            projection: {
                'warn_punishments': 1
            }
        });
    }

    async addPunishment(punishment: Punishment) {
        const query: UpdateFilter<Guild> = {
            $push: {
                'warn_punishments': punishment
            }
        };

        const result = await this.collection.updateOne(this.filter, query);
        if(result.matchedCount) return true;
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

        const result = await this.collection.updateOne(this.filter, query);
        if(result.matchedCount) return true;
        else return false;
    }

    /***************************************************
     ***************** Permit settings *****************
     ***************************************************/

    permits() {
        type returnType = Pick<Guild, 'custom_permits'>;

        return this.collection.findOne<returnType>(this.filter, {
            projection: {
                'custom_permits': 1
            }
        });
    }
    
    async addPermit(permit: Permit) {
        const query: UpdateFilter<Guild> = {
            $push: {
                'custom_permits': permit
            }
        };

        permit.roles = permit.roles.map(p => new Long(p)) as unknown as string[];
        permit.users = permit.users.map(u => new Long(u)) as unknown as string[];

        const result = await this.collection.updateOne(this.filter, query);
        if(result.matchedCount) return true;
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

        const result = await this.collection.updateOne(this.filter, query);
        if(result.matchedCount) return true;
        else return false;
    }

    async setPermissions(permitName: string, permissions: string[]) {
        const aggResult = await this.collection.aggregate<{ permitIndex: number }>([
            {
                $match: this.filter
            },
            {
                $project: {
                    permitIndex: {
                        $indexOfArray: ['$custom_permits.name', permitName]
                    }
                }
            }
        ]).toArray();

        if(aggResult.length === 0) throw new Error(`No permit found with name ${permitName}`);

        const query: UpdateFilter<Guild> = {
            $set: {
                [`custom_permits.${aggResult[0].permitIndex}.permissions`]: permissions
            }
        };

        const result = await this.collection.updateOne(this.filter, query);
        if(result.matchedCount > 0) return true;
        else return false;
    }

    async setRoles(permitName: string, roles: string[]) {
        roles = roles.map(r => new Long(r)) as unknown as string[];

        const aggResult = await this.collection.aggregate<{ permitIndex: number }>([
            {
                $match: this.filter
            },
            {
                $project: {
                    permitIndex: {
                        $indexOfArray: ['$custom_permits.name', permitName]
                    }
                }
            }
        ]).toArray();

        if(aggResult.length === 0) throw new Error(`No permit found with name ${permitName}`);

        const query: UpdateFilter<Guild> = {
            $set: {
                [`custom_permits.${aggResult[0].permitIndex}.roles`]: roles
            }
        };

        const result = await this.collection.updateOne(this.filter, query);
        if(result.matchedCount > 0) return true;
        else return false;
    }

    /***************************************************
     ********** Advertisment Warning settings **********
     ***************************************************/

    adwarnSettings() {
        type returnType = Pick<Guild, 'adwarning_settings'>;

        return this.collection.findOne<returnType>(this.filter, {
            projection: {
                'adwarning_settings': 1
            }
        });
    }

    async setAdwarnStatus(status: boolean) {
        const query: UpdateFilter<Guild> = {
            $set: {
                'adwarning_settings.status': status
            }
        };

        const result = await this.collection.updateOne(this.filter, query);
        if(result.matchedCount) return true;
        else return false;
    }

    async setAdwarnChannel(channel: string) {
        channel = new Long(channel) as unknown as string;

        const query: UpdateFilter<Guild> = {
            $set: {
                'adwarning_settings.channel': channel
            }
        };

        const result = await this.collection.updateOne(this.filter, query);
        if(result.matchedCount) return true;
        else return false;
    }

    async setAdwarnDmStatus(status: boolean) {
        const query: UpdateFilter<Guild> = {
            $set: {
                'adwarning_settings.send_dm': status
            }
        };

        const result = await this.collection.updateOne(this.filter, query);
        if(result.matchedCount) return true;
        else return false;
    }

    async setAdwarnMessage(message: Message | null) {
        const query: UpdateFilter<Guild> = {
            $set: {
                'adwarning_settings.message_template': message
            }
        };

        const result = await this.collection.updateOne(this.filter, query);
        if(result.matchedCount) return true;
        else return false;
    }

    /***************************************************
     ***************** Report settings *****************
     ***************************************************/

    reportSettings() {
        type returnType = Pick<Guild, 'reports'>;

        return this.collection.findOne<returnType>(this.filter, {
            projection: {
                'reports': 1
            }
        });
    }

    async setReportsStatus(status: boolean) {
        const query: UpdateFilter<Guild> = {
            $set: {
                'reports.status': status
            }
        };

        const result = await this.collection.updateOne(this.filter, query);
        if(result.matchedCount) return true;
        else return false;
    }

    async setReportsChannel(channel: string) {
        channel = new Long(channel) as unknown as string;

        const query: UpdateFilter<Guild> = {
            $set: {
                'reports.channel': channel
            }
        };

        const result = await this.collection.updateOne(this.filter, query);
        if(result.matchedCount) return true;
        else return false;
    }

    /***************************************************
     **************** Template settings ****************
     ***************************************************/
    
    async setMessageTemplate(template: Message) {
        const filter = {
            ...this.filter,
            'templates.messages.id': template.id
        };

        const query: UpdateFilter<Guild> = {
            $set: {
                'templates.messages.$': template
            }
        };

        const result = await this.collection.updateOne(filter, query);
        if(result.matchedCount) return true;
        else return false;
    }


    /***************************************************
     ****************** Other getters ******************
     ***************************************************/

    templates() {
        type returnType = Pick<Guild, 'templates'>;

        return this.collection.findOne<returnType>(this.filter, {
            projection: {
                'templates': 1
            }
        });
    }

    applications() {
        type returnType = Pick<Guild, 'applications'>;

        return this.collection.findOne<returnType>(this.filter, {
            projection: {
                'applications': 1
            }
        });
    }

    async allSettings() {
        type returnType = Pick<Guild,
            'adwarning_settings' | 'mod_stats' | 'compact_responses' | 
            'prefix' | 'custom_permits' | 'warn_punishments' |
            'templates' | 'premium' | 'reports'
        >;

        const data = await this.collection.findOne<returnType>(this.filter, {
            projection: {
                'adwarning_settings': 1,
                'mod_stats': 1,
                'compact_responses': 1,
                'prefix': 1,
                'custom_permits': 1,
                'warn_punishments': 1,
                'templates': 1,
                'premium': 1,
                'reports': 1
            }
        });

        // @ts-expect-error Because the guy decided to have "enabled"/"disabled" in the status field
        if(data) data.mod_stats.status = data.mod_stats.status === 'enabled';

        return data;
    }
}