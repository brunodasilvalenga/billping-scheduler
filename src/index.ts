import dotenv from 'dotenv'
import { setupWorker } from './workers/emailWorker'
import { scheduleEmailForUser } from './services/schedulerService'

dotenv.config()

// Initialize jobs on server start
scheduleEmailForUser()
const worker = setupWorker()

worker?.on('completed', job => {
  console.log(`${job.id} has completed!`)
})

worker?.on('failed', (job, err) => {
  console.log(`${job?.id} has failed with ${err.message}`)
})

process.on('SIGTERM', async () => {
  console.info('SIGTERM signal received: closing queues')

  await worker?.close()

  console.info('All closed')
})
