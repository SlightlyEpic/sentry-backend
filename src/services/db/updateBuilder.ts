import { Guild, Message, Permit, Punishment } from '@/types/db';
import { UpdateFilter } from 'mongodb';
import { DeepWriteable } from '@/types/typeMagic';

export class UpdateBuilder {
    query: DeepWriteable<UpdateFilter<Guild>>;

    constructor() {
        this.query = {};
    }

    getQuery(): UpdateFilter<Guild> {
        return this.query as UpdateFilter<Guild>;
    }

    /***************************************************
     **************** General settings *****************
     ***************************************************/

    setPrefix(prefix: string) {
        if(!this.query.$set) this.query.$set = {};

        this.query.$set['prefix'] = prefix;
    }

    /***************************************************
     *************** Punishment settings ***************
     ***************************************************/

    addPunishment(punishment: Punishment) {
        if(!this.query.$push) this.query.$push = {};
        if(!this.query.$push['warn_punishments']) this.query.$push['warn_punishments'] = {
            $each: []
        };

        const queryPunish = this.query.$push['warn_punishments']!;

        if('$each' in queryPunish) {
            queryPunish.$each!.push(punishment);
        }
    }

    // Since Punishment has no unique identifier for some reason
    // It will have to be a complete match to be removed
    removePunishment(punishment: Punishment) {
        if(!this.query.$pullAll) this.query.$pullAll = {};
        if(!this.query.$pullAll['warn_punishments']) this.query.$pullAll['warn_punishments'] = [];

        this.query.$pullAll['warn_punishments'].push(punishment);
    }

    /***************************************************
     ***************** Permit settings *****************
     ***************************************************/
    
    addPermit(permit: Permit) {
        if(!this.query.$push) this.query.$push = {};
        if(!this.query.$push['custom_permits']) this.query.$push['custom_permits'] = {
            $each: []
        };

        const queryPermit = this.query.$push['custom_permits']!;

        if('$each' in queryPermit) {
            queryPermit.$each!.push(permit);
        }
    }

    removePermit(permitName: string) {
        if(!this.query.$pull) this.query.$pull = {};
        if(!this.query.$pull['custom_permits']) this.query.$pull['custom_permits'] = {};
        if(!this.query.$pull['custom_permits'].name) this.query.$pull['custom_permits'].name = {
            $in: []
        };

        type inType = typeof this.query.$pull.custom_permits.name;
        const qName = this.query.$pull['custom_permits'].name as Exclude<inType, string>;
        
        qName.$in!.push(permitName);
    }

    /**@todo */
    setPermissions(permitIndex: number, permissions: string[]) {
        
    }

    /**@todo */
    setRoles(permitIndex: number, roles: string[]) {

    }

    /***************************************************
     ********** Advertisment Warning settings **********
     ***************************************************/

    setAdwarnStatus(status: boolean) {
        if(!this.query.$set) this.query.$set = {};
        this.query.$set['adwarning_settings.status'] = status;
    }

    setAdwarnChannel(channel: string) {
        if(!this.query.$set) this.query.$set = {};
        this.query.$set['adwarning_settings.channel'] = channel;
    }

    setAdwarnDmStatus(status: boolean) {
        if(!this.query.$set) this.query.$set = {};
        this.query.$set['adwarning_settings.send_dm'] = status;
    }

    setAdwarnMessage(message: Message | null) {
        if(!this.query.$set) this.query.$set = {};
        this.query.$set['adwarning_settings.message_template'] = message;
    }

    /***************************************************
     ***************** Report settings *****************
     ***************************************************/

    setReportsStatus(status: boolean) {
        if(!this.query.$set) this.query.$set = {};
        this.query.$set['reports.status'] = status;
    }

    setReportsChannel(channel: string | null) {
        if(!this.query.$set) this.query.$set = {};
        this.query.$set['reports.channel'] = channel;
    }
}
