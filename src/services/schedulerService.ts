// src/services/schedulerService.ts
import { Cron, scheduledJobs } from 'croner'
import { getNextEmailSchedule } from '../utils/dateUtils'
import allTimezones from '../utils/timezone'
import { DigestFrequency } from '../types/user'
import { sendReactEmail } from './emailService'
import cronitor from 'cronitor'
import { client } from '../utils/db'
import { AWSRoleManager } from './awsSts'
import { AWSCostManager, DateRange } from './awsCostManager'
import { startOfWeek, format } from 'date-fns'
import { env } from '../utils/env.mjs'

const cronerMonitored = cronitor(process.env.CRONITOR_KEY!)

export function scheduleEmailForUser() {
  Object.keys(allTimezones).forEach(async timezone => {
    try {
      // Calculate the next schedule time (9 AM local time for this timezone)
      const dailyNextSchedule = getNextEmailSchedule(timezone, 1)
      const dailyCronTime = `${dailyNextSchedule.getMinutes()} ${dailyNextSchedule.getHours()} * * *`
      const dailyJobName = `${timezone}|${DigestFrequency.Daily}`
      const dailyJob = scheduledJobs.find(j => j.name === dailyJobName)

      // Check if a job already exists for this timezone and digest frequency
      if (!dailyJob) {
        const cron = Cron(dailyCronTime, { name: dailyJobName, timezone }, async () => {
          let asyncWorker = cronerMonitored.wrap('daily-email-job', async () => {
            try {
              console.log(`[Cron] - Trigger job to queue - Email job for timezone: ${timezone}, digest: ${DigestFrequency.Daily}`)
              const cloud_providers = await client.execute(`
                SELECT
                    cp.id,
                    cp.name as cloud_provider_name,
                    cp.account_id,
                    cp.provider,
                    cp.team_id,
                    cp.is_connected,
                    t.name as team_name,
                    u.email as user_email,
                    u.name as user_name,
                    u.timezone
                FROM cloud_providers cp
                JOIN teams t ON cp.team_id = t.id
                JOIN team_members tm ON t.id = tm.team_id
                JOIN user u ON tm.user_id = u.id
                WHERE cp.provider = 'aws'
                AND u.timezone = '${timezone}';`)

              if (!cloud_providers.rows.length) {
                console.log(`[Cron] - No cloud providers found for timezone: ${timezone}, digest: ${DigestFrequency.Daily}`)
                return
              }

              for (const provider of cloud_providers.rows) {
                const roleManager = new AWSRoleManager()
                try {
                  const credentials = await roleManager.assumeRole({
                    roleArn: `arn:aws:iam::${provider.account_id}:role/${env.AWS_CONNECTOR_ASSUME_ROLE_NAME}`,
                    roleSessionName: 'billping-connector',
                    durationSeconds: 3600,
                    region: 'us-east-1',
                    externalId: provider.team_id! as string,
                  })

                  if (credentials && provider.is_connected === 0) {
                    await client.execute(`UPDATE cloud_providers SET is_connected = 1 WHERE id LIKE "${provider.id}";`)
                  }

                  const costManager = new AWSCostManager({ credentials })

                  const today = new Date()
                  const dateRange: DateRange = {
                    startDate: format(startOfWeek(today), 'yyyy-MM-dd'),
                    endDate: format(today, 'yyyy-MM-dd'),
                  }

                  const report = await costManager.getCostReport(dateRange)

                  sendReactEmail(provider.user_email, `BillPing - ${report.reportPeriod}`, {
                    accountName: provider.cloud_provider_name,
                    userName: provider.user_name,
                    provider: provider.provider,
                    reportPeriod: report.reportPeriod,
                    periodCost: report.periodCost,
                    periodChange: report.periodChange,
                    monthCost: report.monthCostToDate,
                    monthChange: report.monthChange,
                    forecast: report.forecast,
                    forecastMonth: report.forecastMonth,
                    lastPeriodCost: report.previousPeriodCost,
                    lastMonthCost: report.previousMonthCost,
                    forecastChange: report.forecastChange,
                    lastSevenDaysDailyCost: report.getLastSevenDaysDailyCost,
                  })
                  console.info(`[Job] - Email sent to user: [ ID: ${provider.id} - Email: ${provider.user_email} ].`)
                } catch (error) {
                  await client.execute(`UPDATE cloud_providers SET is_connected = 0 WHERE id LIKE "${provider.id}";`)
                  // send email to user informing wasn't possible to connect to the account.
                  console.error(`[Cron] - Error sending email to user:`, error)
                }
              }
            } catch (error) {
              console.error(`[Cron] - Error in daily job for timezone ${timezone}:`, error)
            }
          })
          await asyncWorker()
        })
        if (cron.nextRun()) {
          console.log(`[Cron][Daily] - Next run for ${dailyJobName} is ${cron.nextRun()}`)
        }
      }
    } catch (error) {
      console.log(error)
    }
  })
}
