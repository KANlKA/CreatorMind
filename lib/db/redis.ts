import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export default redis;

// Helper functions
export async function cacheSet(key: string, value: any, expirationSeconds?: number) {
  if (expirationSeconds) {
    await redis.set(key, JSON.stringify(value), { ex: expirationSeconds });
  } else {
    await redis.set(key, JSON.stringify(value));
  }
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const data = await redis.get(key);
  if (!data) return null;
  return typeof data === 'string' ? JSON.parse(data) : (data as T);
}

export async function cacheDel(key: string) {
  await redis.del(key);
}

export async function cacheExists(key: string): Promise<boolean> {
  const result = await redis.exists(key);
  return result === 1;
}