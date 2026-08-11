// Simple in-memory rate limiter (per IP) — suitable for small deployments or dev
const windows = new Map();

const rateLimiter = (opts = {}) => {
  const windowMs = opts.windowMs || 60000; // 1 minute
  const max = opts.max || 120; // max requests per window

  return (req, res, next) => {
    const key = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const now = Date.now();
    const entry = windows.get(key) || { count: 0, start: now };

    if (now - entry.start > windowMs) {
      entry.count = 0;
      entry.start = now;
    }

    entry.count += 1;
    windows.set(key, entry);

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - entry.count));

    if (entry.count > max) {
      res.status(429).json({ message: 'Too many requests' });
      return;
    }

    next();
  };
};

module.exports = rateLimiter;
