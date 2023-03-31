import PQueue from 'p-queue'
import pRetry from 'p-retry'

const queue = new PQueue({ interval: 1000, intervalCap: 4 })

export const fetchNotion = (...args: Parameters<typeof fetch>) => {
  return queue.add(() =>
    pRetry(
      () => {
        console.log(`Fetching ${args[0]}`)
        return fetch(...args)
      },
      {
        retries: 5,
        onFailedAttempt: async (r) => {
          console.warn(`WARN: Error while querying Notion, retry #${r.attemptNumber}`)
          await new Promise((res) => setTimeout(res, 1000))
        },
      },
    ),
  ) as Promise<Response>
}
