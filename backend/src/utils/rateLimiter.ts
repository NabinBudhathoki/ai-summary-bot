import { Request, Response, NextFunction } from "express";

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

export class RateLimiter {
  private static requests = new Map<string, RateLimitInfo>();
  private static readonly WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  private static readonly MAX_REQUESTS = 10; // 10 requests per window

  static middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const clientId = this.getClientId(req);
      const now = Date.now();

      // Clean up old entries
      this.cleanup();

      const current = this.requests.get(clientId);

      if (!current) {
        // First request from this client
        this.requests.set(clientId, {
          count: 1,
          resetTime: now + this.WINDOW_MS,
        });
        this.addHeaders(res, 1);
        return next();
      }

      if (now > current.resetTime) {
        // Window has reset
        this.requests.set(clientId, {
          count: 1,
          resetTime: now + this.WINDOW_MS,
        });
        this.addHeaders(res, 1);
        return next();
      }

      if (current.count >= this.MAX_REQUESTS) {
        // Rate limit exceeded
        this.addHeaders(res, current.count, current.resetTime);
        res.status(429).json({
          error: "Rate limit exceeded",
          message: `Too many requests. Maximum ${
            this.MAX_REQUESTS
          } requests per ${this.WINDOW_MS / 60000} minutes.`,
          retryAfter: Math.ceil((current.resetTime - now) / 1000),
        });
        return;
      }

      // Increment counter
      current.count++;
      this.addHeaders(res, current.count, current.resetTime);
      next();
    };
  }

  private static getClientId(req: Request): string {
    // Use IP address as client identifier
    return req.ip || req.connection.remoteAddress || "unknown";
  }

  private static addHeaders(
    res: Response,
    current: number,
    resetTime?: number
  ) {
    res.setHeader("X-RateLimit-Limit", this.MAX_REQUESTS);
    res.setHeader(
      "X-RateLimit-Remaining",
      Math.max(0, this.MAX_REQUESTS - current)
    );

    if (resetTime) {
      res.setHeader("X-RateLimit-Reset", Math.ceil(resetTime / 1000));
    }
  }

  private static cleanup() {
    const now = Date.now();
    for (const [key, value] of this.requests.entries()) {
      if (now > value.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}
