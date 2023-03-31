import PQueue from 'p-queue'
import pRetry from 'p-retry'

const queue = new PQueue({ interval: 1000, intervalCap: 4 })

export const fetchNotion = (...args: Parameters<typeof fetch>) => {
  return queue.add(() =>
    pRetry(() => fetch(...args), {
      retries: 5,
      onFailedAttempt: async () => new Promise((res) => setTimeout(res, 1000)),
    }),
  ) as Promise<Response>
}
