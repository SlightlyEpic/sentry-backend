import 'dotenv/config';
import { openKv } from '@deno/kv';
import * as discordStrategy from './lib/strategy';
import { createApp } from './app';

const PORT = process.env.PORT || 3001;

(async () => {
    const passportUserKv = await openKv('temp/kv.db');

    await discordStrategy.init(passportUserKv);
    const app = createApp();

    app.listen(PORT, () => {
        console.log(`Listening on port ${PORT}`);
    });
})();
