// src/config/cronJobs.ts
import { scheduleEmailForUser } from '../services/schedulerService'
import { User } from '../types/user'
import { worker } from '../workers/emailWorker'

// Example user data (replace with actual database fetch)
const users: User[] = [
  { id: '2', email: 'user2@example.com', timezone: 'Europe/London', digestFrequency: 'weekly', preferredDayForWeekly: 1 },
  { id: '1', email: 'user1@example.com', timezone: 'America/New_York', digestFrequency: 'daily' },
  { id: '3', email: 'user3@example.com', timezone: 'Australia/Sydney', digestFrequency: 'daily' },
  { id: '4', email: 'user4@example.com', timezone: 'Australia/Sydney', digestFrequency: 'daily' },
]

// Schedule aggregated emails with Bree
export function initializeBreeJobs() {
  scheduleEmailForUser(users)
}
