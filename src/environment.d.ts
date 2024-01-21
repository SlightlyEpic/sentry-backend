declare global {
    namespace NodeJS {
        interface ProcessEnv {
            PORT: number
            ORIGIN: string
            NODE_ENV: 'development' | 'production'
            S_SECRET: string
            DISCORD_CLIENT_ID: string
            DISCORD_CLIENT_SECRET: string
            DISCORD_REDIRECT_URL: string
            DISCORD_TOKEN: string
        }
    }
}

export {};
