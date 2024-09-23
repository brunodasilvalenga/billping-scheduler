import { addDays, addWeeks, setHours, setMinutes, setDay, isAfter } from 'date-fns'
import { TZDate } from '@date-fns/tz'

export function getNextEmailSchedule(timezone: string, preferredDay?: number): Date {
  const now = new Date()
  const zonedNow = new TZDate(now, timezone)

  let schedule = setHours(setMinutes(zonedNow, 29), 0)

  if (preferredDay !== undefined) {
    schedule = setDay(schedule, preferredDay, { weekStartsOn: 0 })
    if (!isAfter(schedule, zonedNow)) {
      schedule = addWeeks(schedule, 1)
    }
  } else if (!isAfter(schedule, zonedNow)) {
    schedule = addDays(schedule, 1)
  }

  return schedule
}
