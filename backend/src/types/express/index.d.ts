export interface UserFromToken {
    id: number;
}

declare global {
    namespace Express {
        interface Request {
            user: UserFromToken;
        }
    }
}

export interface AuthenticatedRequest extends Request {
    user: UserPayload;
}
