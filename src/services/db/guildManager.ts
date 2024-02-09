import { Guild, Message, Permit, Punishment } from '@/types/db';
import { Collection, Filter, Long, UpdateFilter } from 'mongodb';

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
        return this.collection.findOne(this.filter);
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
        if(result.modifiedCount) return true;
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

        const result = await this.collection.updateOne(this.filter, query);
        if(result.modifiedCount) return true;
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

        const result = await this.collection.updateOne(this.filter, query);
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

        const result = await this.collection.updateOne(this.filter, query);
        if(result.modifiedCount) return true;
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
                [`custom_permits.permissions.${aggResult[0].permitIndex}`]: permissions
            }
        };

        const result = await this.collection.updateOne(this.filter, query);
        if(result.matchedCount > 0) return true;
        else return false;
    }

    async setRoles(permitName: string, roles: string[]) {
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
                [`custom_permits.roles.${aggResult[0].permitIndex}`]: roles
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
        if(result.modifiedCount) return true;
        else return false;
    }

    async setAdwarnChannel(channel: string) {
        const query: UpdateFilter<Guild> = {
            $set: {
                'adwarning_settings.channel': channel
            }
        };

        const result = await this.collection.updateOne(this.filter, query);
        if(result.modifiedCount) return true;
        else return false;
    }

    async setAdwarnDmStatus(status: boolean) {
        const query: UpdateFilter<Guild> = {
            $set: {
                'adwarning_settings.send_dm': status
            }
        };

        const result = await this.collection.updateOne(this.filter, query);
        if(result.modifiedCount) return true;
        else return false;
    }

    async setAdwarnMessage(message: Message | null) {
        const query: UpdateFilter<Guild> = {
            $set: {
                'adwarning_settings.message_template': message
            }
        };

        const result = await this.collection.updateOne(this.filter, query);
        if(result.modifiedCount) return true;
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
        if(result.modifiedCount) return true;
        else return false;
    }

    async setReportsChannel(channel: string) {
        const query: UpdateFilter<Guild> = {
            $set: {
                'reports.channel': channel
            }
        };

        const result = await this.collection.updateOne(this.filter, query);
        if(result.modifiedCount) return true;
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

    allSettings() {
        type returnType = Pick<Guild,
            'adwarning_settings' | 'mod_stats' | 'compact_responses' | 
            'prefix' | 'custom_permits' | 'warn_punishments' |
            'reports' | 'templates' | 'premium'
        >;

        return this.collection.findOne<returnType>(this.filter, {
            projection: {
                'adwarning_settings': 1,
                'mod_stats': 1,
                'compact_responses': 1,
                'prefix': 1,
                'custom_permits': 1,
                'warn_punishments': 1,
                'reports': 1,
                'templates': 1,
                'premium': 1
            }
        });
    }
}