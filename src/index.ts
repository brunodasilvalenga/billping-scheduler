import dotenv from 'dotenv'
import { scheduleEmailForUser } from './services/schedulerService'

dotenv.config()

// Initialize jobs on server start
scheduleEmailForUser()
