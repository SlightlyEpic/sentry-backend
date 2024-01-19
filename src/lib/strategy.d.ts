declare global {
    namespace Express {
        interface User {
            username: string
            id: number
            accessToken: string
            refreshToken: string
        }
    }
}

export {};
