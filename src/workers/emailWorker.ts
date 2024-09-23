import { Worker, Job } from 'bullmq'
import IORedis from 'ioredis'
import { sendEmail } from '../services/emailService'
import { emailQueue, redisConnection } from '../queues/config'
import { DigestFrequency } from '../types/user'

export const worker = new Worker(
  emailQueue.name,
  async (job: Job) => {
    console.log(`${job.id} is processing...`)
    const { email, digestType, timezone } = job.data.user
    const subject = digestType === DigestFrequency.Daily ? 'Daily Billing Digest' : 'Weekly Billing Digest'
    const content = `<p>Here are your ${digestType} billing insights.</p></br><p>Timezone: ${timezone}</p>`

    await sendEmail(email, subject, content)
  },
  {
    connection: redisConnection,
    removeOnComplete: {
      age: 3600, // keep up to 1 hour
    },
  },
)

console.log('Worker started!')

process.on('SIGTERM', async () => {
  console.info('SIGTERM signal received: closing queues')

  await worker.close()

  console.info('All closed')
})
