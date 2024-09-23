import { Redis } from '@upstash/redis'
import dotenv from 'dotenv'

dotenv.config()

// const redis = new Redis({
//   url: process.env.REDIS_URL,
//   token: process.env.REDIS_TOKEN,
// })

const redis = {
  host: process.env.REDIS_URL,
  port: 6379,
  password: process.env.REDIS_TOKEN,
  tls: {},
}

export default redis
