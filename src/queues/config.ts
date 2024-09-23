import { Queue } from 'bullmq'
import IORedis from 'ioredis'
import dotenv from 'dotenv'

dotenv.config()

export const redisConnection = new IORedis(process.env.REDIS_URL!, { maxRetriesPerRequest: null })

// Create and export email queue
export const emailQueue = new Queue('emailSending', { connection: redisConnection })

console.log('Queues setup completed.')
