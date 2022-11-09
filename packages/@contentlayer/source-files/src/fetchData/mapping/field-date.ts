import type * as core from '@contentlayer/core'
import { Temporal } from '@contentlayer/utils'
import { pipe, T } from '@contentlayer/utils/effect'

import { FetchDataError } from '../../errors/index.js'

export const makeDateField = ({
  dateString,
  fieldName,
  options,
}: {
  dateString: string
  fieldName: string
  options: core.PluginOptions
}) =>
  pipe(
    T.try(() => {
      const dateHasExplitcitTimezone = () => {
        try {
          Temporal.TimeZone.from(dateString)
          return true
        } catch {
          return false
        }
      }

      // See Temporal docs https://tc39.es/proposal-temporal/docs/
      if (options.date?.timezone !== undefined && dateHasExplitcitTimezone() === false) {
        const instant = new Date(dateString).toTemporalInstant()
        const desiredTimezone = Temporal.TimeZone.from(options.date.timezone)
        const offsetNs = desiredTimezone.getOffsetNanosecondsFor(instant)

        return instant.subtract({ nanoseconds: offsetNs }).toString()
      } else {
        return new Date(dateString).toISOString()
      }
    }),
    T.catchAll(() =>
      FetchDataError.IncompatibleFieldDataError.fail({ incompatibleFieldData: [[fieldName, dateString]] }),
    ),
  )
