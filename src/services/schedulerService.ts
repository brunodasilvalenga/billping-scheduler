// src/services/schedulerService.ts
import cron from 'node-cron'
import { userEventEmitter } from '../events/userEvents'
import { getNextEmailSchedule } from '../utils/dateUtils'
import { type User } from '../types/user'
import { emailQueue } from '../queues/config'

// Group users by timezone and digest type
function groupUsersByTimezone(users: User[]): Record<string, User[]> {
  return users.reduce((acc, user) => {
    const key = `${user.timezone}|${user.digestFrequency}`
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(user)
    return acc
  }, {} as Record<string, User[]>)
}

// Schedule emails for a single user (used when a new user is added)
export function scheduleEmailForUser(users: User[]) {
  const groupedUsers = groupUsersByTimezone(users)

  Object.keys(groupedUsers).forEach(key => {
    const [timezone, digestFrequency] = key.split('|')
    const timezoneUsers = groupedUsers[key]

    // Calculate the next schedule time (8 AM local time for this timezone)
    const nextSchedule = getNextEmailSchedule(timezone, digestFrequency === 'weekly' ? timezoneUsers[0].preferredDayForWeekly : undefined)
    const cronTime = `${nextSchedule.getMinutes()} ${nextSchedule.getHours()} * * ${digestFrequency === 'weekly' ? nextSchedule.getDay() : '*'}`

    cron.schedule(
      cronTime,
      async () => {
        console.log(`[Cron] - Sending job to queue: Email job for timezone: ${timezone}, digest: ${digestFrequency}`)
        timezoneUsers.forEach(async user => {
          await emailQueue.add(user.id, {
            user,
          })
        })
      },
      {
        scheduled: true,
        timezone,
      },
    )

    console.log(`Scheduled email job for timezone: ${timezone}, digest: ${digestFrequency}, at ${cronTime}`)
  })
}

// Listen for the 'newUser' event and schedule the user's digest email
userEventEmitter.on('newUser', (user: User) => {
  console.log(`New user event received: ${user.email}`)
  // scheduleEmailForUser(user)
})
