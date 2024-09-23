export interface User {
  id: string
  email: string
  timezone: string
  digestFrequency: 'daily' | 'weekly'
  preferredDayForWeekly?: number
}
