import { DigestFrequency, User } from '../types/user'

export function getUsers(filterParams?: { timezone?: string; digestFrequency?: string }): User[] {
  const users: User[] = [
    { id: '1', email: 'brunodasilvalenga@gmail.com', timezone: 'America/New_York', digestFrequency: DigestFrequency.Daily },
    { id: '2', email: 'brunodasilvalenga@gmail.com', timezone: 'Europe/London', digestFrequency: DigestFrequency.Weekly, preferredDayForWeekly: 1 },
    { id: '3', email: 'brunodasilvalenga@gmail.com', timezone: 'Australia/Sydney', digestFrequency: DigestFrequency.Daily },
    { id: '4', email: 'brunodasilvalenga@gmail.com', timezone: 'Australia/Sydney', digestFrequency: DigestFrequency.Daily },
    { id: '5', email: 'brunodasilvalenga@gmail.com', timezone: 'America/Sao_Paulo', digestFrequency: DigestFrequency.Daily },
  ]

  if (filterParams) {
    return users.filter(
      user =>
        (!filterParams.timezone || user.timezone === filterParams.timezone) &&
        (!filterParams.digestFrequency || user.digestFrequency === filterParams.digestFrequency),
    )
  }

  return users
}
