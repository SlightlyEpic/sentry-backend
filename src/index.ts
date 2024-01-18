import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';

import * as discordStrategy from './lib/strategy';
import apiRouter from './routes/apiRouter';

discordStrategy.init();

const PORT = process.env.PORT || 3001;
const app = express();

/////////////////////////////////////////////////////////////////////////////////////////////////////////

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
    }
}));

// passport
app.use(passport.initialize());
app.use(passport.session());


// Routers
app.use('/api', apiRouter);

/////////////////////////////////////////////////////////////////////////////////////////////////////////

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
