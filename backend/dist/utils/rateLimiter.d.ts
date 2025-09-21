import { Request, Response, NextFunction } from "express";
export declare class RateLimiter {
    private static requests;
    private static readonly WINDOW_MS;
    private static readonly MAX_REQUESTS;
    static middleware(): (req: Request, res: Response, next: NextFunction) => void;
    private static getClientId;
    private static addHeaders;
    private static cleanup;
}
//# sourceMappingURL=rateLimiter.d.ts.map