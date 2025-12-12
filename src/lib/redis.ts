import IORedis from 'ioredis';

let redis: IORedis | null = null;

if (process.env.REDIS_DISABLE === 'true') {
  //console.log('Redis is disabled for development/testing.');
} else {
  try {
    redis = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');
    redis.on('error', (err) => {
      console.warn('Redis connection failed, caching disabled.', err.message);
    });
  } catch (e) {
    console.warn('Redis not initialized, caching disabled.');
  }
}

export default redis;

