// src/services/schedulerService.ts
import { Cron, scheduledJobs } from 'croner'
import { getNextEmailSchedule } from '../utils/dateUtils'
import allTimezones from '../utils/timezone'
import { getUsers } from './usersService'
import { DigestFrequency } from '../types/user'
import { sendEmail } from './emailService'

export function scheduleEmailForUser() {
  Object.keys(allTimezones).forEach(timezone => {
    try {
      // Calculate the next schedule time (9 AM local time for this timezone)
      const weeklyNextSchedule = getNextEmailSchedule(timezone, 1)
      const weeklyCronTime = `${weeklyNextSchedule.getMinutes()} ${weeklyNextSchedule.getHours()} * * ${weeklyNextSchedule.getDay()}`
      const weeklyJobName = `${timezone}|${DigestFrequency.Weekly}`
      const weeklyJob = scheduledJobs.find(j => j.name === weeklyJobName)

      // Check if a job already exists for this timezone and digest frequency
      if (!weeklyJob) {
        const cron = Cron(weeklyCronTime, { name: weeklyJobName, timezone }, async () => {
          try {
            console.log(`[Cron] - Trigger job to queue - Email job for timezone: ${timezone}, digest: ${DigestFrequency.Weekly}`)
            const users = getUsers({ timezone, digestFrequency: DigestFrequency.Weekly })
            if (!users.length) {
              console.log(`[Cron] - No users found for timezone: ${timezone}, digest: ${DigestFrequency.Weekly}`)
              return
            }
            for (const user of users) {
              try {
                console.info(`[Job] - Sending email to user: [ ID: ${user.id} - Email: ${user.email} ] ...`)
                const { email, digestFrequency, timezone } = user
                const subject = digestFrequency === DigestFrequency.Daily ? 'Daily Billing Digest' : 'Weekly Billing Digest'
                const content = `<p>Here are your ${digestFrequency} billing insights.</p></br><p>Timezone: ${timezone}</p>`
                await sendEmail(email, subject, content)
                console.info(`[Job] - Email sent to user: [ ID: ${user.id} - Email: ${user.email} ].`)
              } catch (error) {
                console.error(`[Cron] - Error sending email to user:`, error)
              }
            }
          } catch (error) {
            console.error(`[Cron] - Error in weekly job for timezone ${timezone}:`, error)
          }
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
        const cron = Cron(dailyCronTime, { name: dailyJobName, timezone }, async () => {
          try {
            console.log(`[Cron] - Trigger job to queue - Email job for timezone: ${timezone}, digest: ${DigestFrequency.Daily}`)
            const users = getUsers({ timezone, digestFrequency: DigestFrequency.Daily })
            if (!users.length) {
              console.log(`[Cron] - No users found for timezone: ${timezone}, digest: ${DigestFrequency.Daily}`)
              return
            }

            for (const user of users) {
              try {
                console.info(`[Job] - Sending email to user: [ ID: ${user.id} - Email: ${user.email} ] ...`)
                const { email, digestFrequency, timezone } = user
                const subject = digestFrequency === DigestFrequency.Daily ? 'Daily Billing Digest' : 'Weekly Billing Digest'
                const content = `<p>Here are your ${digestFrequency} billing insights.</p></br><p>Timezone: ${timezone}</p>`
                await sendEmail(email, subject, content)
                console.info(`[Job] - Email sent to user: [ ID: ${user.id} - Email: ${user.email} ].`)
              } catch (error) {
                console.error(`[Cron] - Error sending email to user:`, error)
              }
            }
          } catch (error) {
            console.error(`[Cron] - Error in daily job for timezone ${timezone}:`, error)
          }
        })
        if (cron.nextRun()) {
          console.log(`[Cron] - Next run for ${dailyJobName} is ${cron.nextRun()}`)
        }
      }
    } catch (error) {
      console.log(error)
    }
  })
}
