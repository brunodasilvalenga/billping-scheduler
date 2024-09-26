import { Worker, Job } from 'bullmq'
import { sendEmail } from '../services/emailService'
import { emailQueue } from '../queues/config'
import { DigestFrequency } from '../types/user'
import redis from '../utils/redis'

export function setupWorker() {
  try {
    const worker = new Worker(
      emailQueue.name,
      async (job: Job) => {
        console.log(`${job.id} is processing...`)
        const { email, digestType, timezone } = job.data.user
        const subject = digestType === DigestFrequency.Daily ? 'Daily Billing Digest' : 'Weekly Billing Digest'
        const content = `<p>Here are your ${digestType} billing insights.</p></br><p>Timezone: ${timezone}</p>`

        await sendEmail(email, subject, content)
      },
      {
        connection: redis,
        removeOnComplete: {
          age: 3600, // keep up to 1 hour
        },
      },
    )
    console.log('Worker started!')
    return worker
  } catch (error) {
    console.log('Error setting up email worker:', error)
  }
}
