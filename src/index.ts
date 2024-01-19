import 'dotenv/config';
import * as discordStrategy from './lib/strategy';
import { createApp } from './app';

const PORT = process.env.PORT || 3001;


(async () => {
    await discordStrategy.init();
    const app = createApp();

    app.listen(PORT, () => {
        console.log(`Listening on port ${PORT}`);
    });
})();
