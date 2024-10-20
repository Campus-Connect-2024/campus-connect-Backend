import { redisClient } from "../redis/redisClient.js";

const deleteCacheKey = async (cacheKey) => {
  console.log("Entered deleteCacheKey function with key:", cacheKey); // Log entry

  try {
      console.log("About to check if the cache key exists..."); // Debug log

      // Check if the cache key exists
      const exists = await redisClient.exists(cacheKey);
      // console.log("Reached in the exists check"); // Log for reaching this point

      // console.log("Level 2: Key existence checked");

      if (exists) {
          console.log(`Cache key ${cacheKey} exists. Proceeding to delete.`);
          const reply = await redisClient.del(cacheKey);
          console.log(`Cache cleared for key: ${cacheKey}`);
          return reply; // Return the reply from deletion
      } else {
          console.log(`Cache key ${cacheKey} does not exist.`);
          return null; // Return null if the key doesn't exist
      }

  } catch (error) {
      console.error("Error in deleteCacheKey:", error);
      throw error; // Rethrow the error for handling in the calling function
  }
};

export { deleteCacheKey };
