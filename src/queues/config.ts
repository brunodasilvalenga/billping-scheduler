import { Queue } from 'bullmq'
import redis from '../utils/redis'
// import IORedis from 'ioredis'
// import dotenv from 'dotenv'

// dotenv.config()

// export const redisConnection = new IORedis(process.env.REDIS_URL!, { maxRetriesPerRequest: null })

// Create and export email queue
export const emailQueue = new Queue('emailSending', { connection: redis })

console.log('Queues setup completed.')
