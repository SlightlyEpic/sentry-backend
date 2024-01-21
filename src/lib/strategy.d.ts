declare global {
    namespace Express {
        interface User {
            id: number
            accessToken: string
            refreshToken: string
        }
    }
}

export {};
