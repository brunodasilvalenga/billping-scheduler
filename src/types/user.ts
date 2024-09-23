export enum DigestFrequency {
  Daily = 'daily',
  Weekly = 'weekly',
}

export interface User {
  id: string
  email: string
  timezone: string
  digestFrequency: DigestFrequency
  preferredDayForWeekly?: number
}
