import { rateLimit as rl } from 'express-rate-limit';

export const rateLimit = () => rl({
    windowMs: 5 * 60 * 1000,
    limit: 100,
});
