// src/services/schedulerService.ts
import { Cron, scheduledJobs } from 'croner'
import { getNextEmailSchedule } from '../utils/dateUtils'
import { emailQueue } from '../queues/config'
import allTimezones from '../utils/timezone'
import { getUsers } from './usersService'
import { DigestFrequency } from '../types/user'

export function scheduleEmailForUser() {
  Object.keys(allTimezones).forEach(timezone => {
    // Calculate the next schedule time (9 AM local time for this timezone)
    const weeklyNextSchedule = getNextEmailSchedule(timezone, 1)
    const weeklyCronTime = `${weeklyNextSchedule.getMinutes()} ${weeklyNextSchedule.getHours()} * * ${weeklyNextSchedule.getDay()}`
    const weeklyJobName = `${timezone}|${DigestFrequency.Weekly}`
    const weeklyJob = scheduledJobs.find(j => j.name === weeklyJobName)

    // Check if a job already exists for this timezone and digest frequency
    if (!weeklyJob) {
      const cron = Cron(weeklyCronTime, { name: weeklyJobName, timezone }, () => {
        console.log(`[Cron] - Trigger job to queue - Email job for timezone: ${timezone}, digest: ${DigestFrequency.Weekly}`)
        const users = getUsers({ timezone, digestFrequency: DigestFrequency.Weekly })
        if (!users.length) {
          console.log(`[Cron] - No users found for timezone: ${timezone}, digest: ${DigestFrequency.Weekly}`)
          return
        }
        users.forEach(async user => {
          await emailQueue.add(user.id, {
            user,
          })
        })
        emailQueue.disconnect()
      })
      if (cron.nextRun()) {
        console.log(`[Cron] - Next run for ${weeklyJobName} is ${cron.nextRun()}`)
      }
    }

    // Calculate the next schedule time (9 AM local time for this timezone)
    const dailyNextSchedule = getNextEmailSchedule(timezone, 1)
    const dailyCronTime = `${dailyNextSchedule.getMinutes()} ${dailyNextSchedule.getHours()} * * *`
    const dailyJobName = `${timezone}|${DigestFrequency.Daily}`
    const dailyJob = scheduledJobs.find(j => j.name === dailyJobName)

    // Check if a job already exists for this timezone and digest frequency
    if (!dailyJob) {
      const cron = Cron(dailyCronTime, { name: dailyJobName, timezone }, () => {
        console.log(`[Cron] - Trigger job to queue - Email job for timezone: ${timezone}, digest: ${DigestFrequency.Daily}`)
        const users = getUsers({ timezone, digestFrequency: DigestFrequency.Daily })
        if (!users.length) {
          console.log(`[Cron] - No users found for timezone: ${timezone}, digest: ${DigestFrequency.Daily}`)
          return
        }
        users.forEach(async user => {
          await emailQueue.add(user.id, {
            user,
          })
        })
        emailQueue.disconnect()
      })
      if (cron.nextRun()) {
        console.log(`[Cron] - Next run for ${dailyJobName} is ${cron.nextRun()}`)
      }
    }
  })
}
