import { createClient } from 'redis';
import logger from "../utils/logger.js";

const redisClient = createClient({
    // Optionally add host and port from environment variables
    url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('connect', () => {
    logger.info('Connected to Redis');
});

redisClient.on('error', (err) => {
    logger.error('Redis error:', err);
});

// Handle unexpected disconnects
redisClient.on('end', () => {
    logger.info('Disconnected from Redis');
});

// Connect to the Redis server with retry logic
async function connectWithRetry() {
    try {
        await redisClient.connect();
    } catch (err) {
        logger.error('Failed to connect to Redis, retrying...', err);
        setTimeout(connectWithRetry, 5000); // Retry after 5 seconds
    }
}

connectWithRetry();

// Handle graceful shutdown
process.on('SIGINT', async () => {
    logger.info('Closing Redis client...');
    if (redisClient.isOpen) {
        await redisClient.quit();
        logger.info('Redis client closed');
    }
    process.exit(0);
});

export { redisClient };
