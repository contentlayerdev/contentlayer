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

// export function buildRequestError(
//   response: SupportedResponse,
//   bodyText: string
// ): APIResponseError | UnknownHTTPResponseError {
//   const apiErrorResponseBody = parseAPIErrorResponseBody(bodyText)
//   if (apiErrorResponseBody !== undefined) {
//     return new APIResponseError({
//       code: apiErrorResponseBody.code,
//       message: apiErrorResponseBody.message,
//       headers: response.headers,
//       status: response.status,
//       rawBodyText: bodyText,
//     })
//   }
//   return new UnknownHTTPResponseError({
//     message: undefined,
//     headers: response.headers,
//     status: response.status,
//     rawBodyText: bodyText,
//   })
// }

// const parseAPIErrorResponseBody = (body: string): { code: notion.APIErrorCode; message: string } | undefined => {
//   if (typeof body !== 'string') {
//     return
//   }

//   let parsed: { message: string, code: notion.APIErrorCode}
//   try {
//     parsed = JSON.parse(body)
//   } catch (parseError) {
//     return
//   }

//   if (
//     !(typeof parsed === 'object' && parsed !== null) ||
//     typeof parsed['message'] !== 'string' ||
//     !(typeof parsed['code'] === "string" && parsed['code'] in notion.APIErrorCode)
//   ) {
//     return
//   }

//   return {
//     ...parsed,
//     code: parsed['code'],
//     message: parsed['message'],
//   }
// }
