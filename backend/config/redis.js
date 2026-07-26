const { createClient } = require('redis');

// Since you are on Windows and don't have Redis installed,
// I am creating a "Mock Redis" that mimics the exact behavior of a Distributed Lock in memory.
// This allows you to test the app right now. For production/placements, you'll just provide a real REDIS_URL.
class MockRedisClient {
  constructor() {
    this.store = new Map();
    this.isOpen = true;
  }

  async connect() {
    console.log('Mock Redis connected successfully (In-Memory Fallback active)');
  }

  // Mimics Redis SET NX PX
  async set(key, value, options) {
    if (options?.NX && this.store.has(key)) {
      return null; // Lock is busy
    }
    this.store.set(key, value);
    if (options?.PX) {
      setTimeout(() => this.store.delete(key), options.PX);
    }
    return 'OK';
  }

  async del(key) {
    this.store.delete(key);
    return 1;
  }
}

// If REDIS_URL is provided (e.g. Upstash cloud redis), use real Redis.
// Otherwise, use our clever Mock to bypass the installation headache!
const useRealRedis = process.env.REDIS_URL;

const redisClient = useRealRedis 
  ? createClient({ url: process.env.REDIS_URL }) 
  : new MockRedisClient();

if (useRealRedis) {
  redisClient.on('error', (err) => console.error('Redis Client Error', err));
  redisClient.on('connect', () => console.log('Redis connected successfully'));
}

const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  } else if (!useRealRedis) {
    await redisClient.connect(); // trigger mock log
  }
};

module.exports = { redisClient, connectRedis };
