import { buildRequestError } from '@notionhq/client/build/src/errors.js'
import PQueue from 'p-queue'
import pRetry, { AbortError } from 'p-retry'

const queue = new PQueue({ interval: 1000, intervalCap: 4 })

export const fetchNotion = (...args: Parameters<typeof fetch>) => {
  return queue.add(() =>
    pRetry(
      async () => {
        const response = await fetch(...args)

        if (!response.ok) {
          const error = buildRequestError(response, await response.text())

          if ([401, 404].includes(response.status)) {
            throw new AbortError(error)
          }

          throw error
        }

        return response
      },
      {
        retries: 5,
        onFailedAttempt: async () => new Promise((res) => setTimeout(res, 1000)),
      },
    ),
  ) as Promise<Response>
}
