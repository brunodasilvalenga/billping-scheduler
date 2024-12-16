import { createClient, type Client } from '@libsql/client'
import { env } from './env.mjs'

const globalForDb = globalThis as unknown as {
  client: Client | undefined
}

export const client =
  globalForDb.client ??
  createClient({
    url: env.DATABASE_URL,
    authToken: env.DATABASE_AUTH_TOKEN,
  })
if (env.NODE_ENV !== 'production') globalForDb.client = client
