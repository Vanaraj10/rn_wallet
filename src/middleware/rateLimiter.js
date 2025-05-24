import ratelimit from "../config/upstash.js";

const rateLimiter = async (req, res, next) => {
    try {
        // Attempt to limit the request using the rate limiter
        const {success} = await ratelimit.limit('my-rate-limit');

        if(!success) {
            // If the request limit is exceeded, send a 429 Too Many Requests response
            return res.status(429).json({ message: "Too many requests, please try again later." });
        }
        next(); // If the request is within the limit, proceed to the next middleware or route handler
    } catch (error) {
        console.error("Rate limiter error:", error);
        next(error);
    }
}

export default rateLimiter;