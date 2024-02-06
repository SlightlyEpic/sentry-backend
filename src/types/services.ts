import type { BotService } from '@/services/bot';
import type { UserGuildsService } from '@/services/guilds';
import type { DbService } from '@/services/db/db';

export type Services = {
    botService: BotService,
    userGuildsService: UserGuildsService,
    dbService: DbService
}
