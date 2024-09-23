import { Queue } from 'bullmq'
import IORedis from 'ioredis'

export const redisConnection = new IORedis('localhost:6379', { maxRetriesPerRequest: null })

// Create and export email queue
export const emailQueue = new Queue('emailSending', { connection: redisConnection })

console.log('Queues setup completed.')
