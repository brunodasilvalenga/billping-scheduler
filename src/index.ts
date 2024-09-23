import dotenv from 'dotenv'
import { worker } from './workers/emailWorker'
import { scheduleEmailForUser } from './services/schedulerService'

dotenv.config()

// Initialize jobs on server start
scheduleEmailForUser()

worker.on('completed', job => {
  console.log(`${job.id} has completed!`)
})

worker.on('failed', (job, err) => {
  console.log(`${job?.id} has failed with ${err.message}`)
})
