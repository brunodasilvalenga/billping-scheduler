import { Worker, Job } from 'bullmq'
import IORedis from 'ioredis'
import { sendEmail } from '../services/emailService'
import { emailQueue, redisConnection } from '../queues/config'

export const worker = new Worker(
  emailQueue.name,
  async (job: Job) => {
    console.log(`${job.id} is processing...`)
    const { email, digestType } = job.data.user
    const subject = digestType === 'daily' ? 'Daily Billing Digest' : 'Weekly Billing Digest'
    const content = `<p>Here are your ${digestType} billing insights.</p>` // Replace with actual billing data

    // await sendEmail(email, subject, content)
    console.log(`Processed email for ${email}`)
  },
  { connection: redisConnection },
)

console.log('Worker started!')

process.on('SIGTERM', async () => {
  console.info('SIGTERM signal received: closing queues')

  await worker.close()

  console.info('All closed')
})
