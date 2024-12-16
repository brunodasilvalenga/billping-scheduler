import { scheduleEmailForUser } from './services/schedulerService'

// Initialize jobs on server start
scheduleEmailForUser()

async function main() {}

main()
