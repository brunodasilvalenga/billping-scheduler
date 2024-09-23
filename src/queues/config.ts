import { Queue } from 'bullmq'
import redis from '../utils/redis'

// Create and export email queue
export const emailQueue = new Queue('emailSending', { connection: redis })

console.log('Queues setup completed.')
