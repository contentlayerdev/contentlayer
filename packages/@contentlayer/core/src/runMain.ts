import type { HasCwd } from '@contentlayer/core'
import { provideCwd } from '@contentlayer/core'
import * as core from '@contentlayer/core'
import { DummyTracing, provideDummyTracing, provideJaegerTracing } from '@contentlayer/utils'
import type { HasClock, HasConsole, OT } from '@contentlayer/utils/effect'
import { Cause, pipe, pretty, provideConsole, T } from '@contentlayer/utils/effect'
import { getContentlayerVersion } from '@contentlayer/utils/node'
import * as os from 'os'

export const runMain =
  ({ tracingServiceName, verbose }: { tracingServiceName: string; verbose: boolean }) =>
  (eff: T.Effect<OT.HasTracer & HasClock & HasCwd & HasConsole, unknown, unknown>) =>
    pipe(
      T.gen(function* ($) {
        if (process.platform === 'win32') {
          yield* $(T.log('Warning: Contentlayer might not work as expected on Windows'))
        }

        // Only use Otel tracing if explicitly enabled via env var
        const provideTracing =
          process.env.CL_OTEL !== undefined ? provideJaegerTracing(tracingServiceName) : provideDummyTracing

        const result = yield* $(pipe(eff, provideTracing, provideCwd, T.result))

        if (result._tag === 'Failure') {
          const failOrCause = Cause.failureOrCause(result.cause)
          const errorWasManaged = failOrCause._tag === 'Left'

          if (!errorWasManaged) {
            yield* $(
              T.log(`\
This error shouldn't have happened. Please consider opening a GitHub issue with the stack trace below here:
https://github.com/contentlayerdev/contentlayer/issues`),
            )
          }

          // If failure was a managed error and no `--verbose` flag was provided, print the error message
          if (errorWasManaged && !verbose) {
            if (!core.isSourceFetchDataError(failOrCause.left) || !failOrCause.left.alreadyHandled) {
              yield* $(T.log(failOrCause.left))
            }
          }
          // otherwise for unmanaged errors or with `--verbose` flag provided, print the entire stack trace
          else {
            yield* $(T.log(pretty(result.cause)))

            const contentlayerVersion = yield* $(getContentlayerVersion()['|>'](T.provide(DummyTracing)))

            yield* $(
              T.log(`
OS: ${process.platform} ${os.release()} (arch: ${process.arch})
Process: ${process.argv.join(' ')}
Node version: ${process.version}
Contentlayer version: ${contentlayerVersion}
`),
            )
          }

          yield* $(T.succeedWith(() => process.exit(1)))
        }
      }),
      provideConsole,
      T.runPromise,
    )
