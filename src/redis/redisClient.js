import { createClient } from 'redis';
import logger from "../utils/logger.js"
const redisClient = createClient({
});

redisClient.on('connect', () => {
    logger.info('Connected to Redis');
});

redisClient.on('error', (err) => {
    logger.error('Redis error:', err);
});

// Connect to the Redis server
(async () => {
    try {
        await redisClient.connect();
    } catch (err) {
        logger.error('Failed to connect to Redis:', err);
    }
})();

export { redisClient };
