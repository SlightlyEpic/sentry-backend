import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import sqlite3 from 'sqlite3';
import sqliteStoreFactory from 'express-session-sqlite';

import apiRouter from './routes/apiRouter';
import { BotService } from './services/bot';
import { UserGuildsService } from './services/guilds';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function createApp(services: {
    botService: BotService,
    userGuildsService: UserGuildsService
}) {
    const app = express();
    const SqliteStore = sqliteStoreFactory(session);

    app.use(express.json());

    // cors
    app.use(cors({
        origin: [process.env.ORIGIN],
        credentials: true,
    }));

    // express-session
    app.use(session({
        secret: process.env.S_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 7 * 24 * 60 * 60 * 1000,        // a week
        },
        store: new SqliteStore({
            driver: sqlite3.Database,
            path: 'temp/session.db',
            ttl: 7 * 24 * 60 * 60 * 1000,
        })
    }));

    // passport
    app.use(passport.initialize());
    app.use(passport.session());

    // Routers
    app.use('/api', apiRouter);

    return app;
}
