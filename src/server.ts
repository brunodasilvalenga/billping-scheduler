import express, { Express, Request, Response } from 'express'
import userRegistration from './api/userRegistration'
import dotenv from 'dotenv'
import { ExpressAdapter } from '@bull-board/express'

import { Queue } from 'bullmq'
import { createBullBoard } from '@bull-board/api'
import { BullAdapter } from '@bull-board/api/bullAdapter'
import { worker } from './workers/emailWorker'
import { emailQueue } from './queues/config'
import { scheduleEmailForUser } from './services/schedulerService'

dotenv.config()

const app: Express = express()
const port = process.env.PORT || 3000

const serverAdapter = new ExpressAdapter()
serverAdapter.setBasePath('/admin/queues')

createBullBoard({
  queues: [new BullAdapter(emailQueue)],
  serverAdapter,
})

app.use(express.json())

app.use('/admin/queues', serverAdapter.getRouter())

// User registration endpoint
app.use('/api', userRegistration)

// Initialize jobs on server start
scheduleEmailForUser()

worker.on('completed', job => {
  console.log(`${job.id} has completed!`)
})

worker.on('failed', (job, err) => {
  console.log(`${job?.id} has failed with ${err.message}`)
})

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`)
})
