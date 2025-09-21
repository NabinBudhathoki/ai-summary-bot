"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiter = void 0;
class RateLimiter {
    static middleware() {
        return (req, res, next) => {
            const clientId = this.getClientId(req);
            const now = Date.now();
            this.cleanup();
            const current = this.requests.get(clientId);
            if (!current) {
                this.requests.set(clientId, {
                    count: 1,
                    resetTime: now + this.WINDOW_MS,
                });
                this.addHeaders(res, 1);
                return next();
            }
            if (now > current.resetTime) {
                this.requests.set(clientId, {
                    count: 1,
                    resetTime: now + this.WINDOW_MS,
                });
                this.addHeaders(res, 1);
                return next();
            }
            if (current.count >= this.MAX_REQUESTS) {
                this.addHeaders(res, current.count, current.resetTime);
                res.status(429).json({
                    error: "Rate limit exceeded",
                    message: `Too many requests. Maximum ${this.MAX_REQUESTS} requests per ${this.WINDOW_MS / 60000} minutes.`,
                    retryAfter: Math.ceil((current.resetTime - now) / 1000),
                });
                return;
            }
            current.count++;
            this.addHeaders(res, current.count, current.resetTime);
            next();
        };
    }
    static getClientId(req) {
        return req.ip || req.connection.remoteAddress || "unknown";
    }
    static addHeaders(res, current, resetTime) {
        res.setHeader("X-RateLimit-Limit", this.MAX_REQUESTS);
        res.setHeader("X-RateLimit-Remaining", Math.max(0, this.MAX_REQUESTS - current));
        if (resetTime) {
            res.setHeader("X-RateLimit-Reset", Math.ceil(resetTime / 1000));
        }
    }
    static cleanup() {
        const now = Date.now();
        for (const [key, value] of this.requests.entries()) {
            if (now > value.resetTime) {
                this.requests.delete(key);
            }
        }
    }
}
exports.RateLimiter = RateLimiter;
RateLimiter.requests = new Map();
RateLimiter.WINDOW_MS = 15 * 60 * 1000;
RateLimiter.MAX_REQUESTS = 10;
//# sourceMappingURL=rateLimiter.js.map