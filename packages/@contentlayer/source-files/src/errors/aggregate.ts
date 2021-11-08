import * as core from '@contentlayer/core'
import { AsciiTree } from '@contentlayer/utils'
import { T } from '@contentlayer/utils/effect'

import type { Flags } from '../types.js'
import type { FetchDataError } from './index.js'

export const handleFetchDataErrors = ({
  errors,
  documentCount,
  options,
  flags,
  schemaDef,
  verbose,
}: {
  errors: readonly FetchDataError.FetchDataError[]
  documentCount: number
  options: core.PluginOptions
  flags: Flags
  schemaDef: core.SchemaDef
  verbose?: boolean
}): T.Effect<unknown, core.HandledFetchDataError, void> =>
  T.gen(function* ($) {
    const filteredErrors = filterErrorsByFlags({ errors, flags })

    if (filteredErrors.length === 0) return

    const shouldFail = failOrSkip({ errors: filteredErrors, flags }) === 'fail'

    const errorMessage = aggregateFetchDataErrors({
      documentCount,
      errors: filteredErrors,
      options,
      shouldFail,
      schemaDef,
      verbose,
    })

    yield* $(T.log(errorMessage))

    if (shouldFail) {
      yield* $(T.fail(new core.HandledFetchDataError()))
    }
  })

export const testOnly_aggregateFetchDataErrors = ({
  errors,
  documentCount,
  options,
  flags,
  schemaDef,
  verbose,
}: {
  errors: readonly FetchDataError.FetchDataError[]
  documentCount: number
  options: core.PluginOptions
  flags: Flags
  schemaDef: core.SchemaDef
  verbose?: boolean
}): string | null => {
  const filteredErrors = filterErrorsByFlags({ errors, flags })

  if (filteredErrors.length === 0) return null

  const shouldFail = failOrSkip({ errors: filteredErrors, flags }) === 'fail'

  return aggregateFetchDataErrors({
    documentCount,
    errors: filteredErrors,
    options,
    shouldFail,
    schemaDef,
    verbose,
  })
}

const aggregateFetchDataErrors = ({
  errors,
  documentCount,
  options,
  shouldFail,
  schemaDef,
  verbose,
}: {
  errors: readonly FetchDataError.FetchDataError[]
  documentCount: number
  options: core.PluginOptions
  shouldFail: boolean
  schemaDef: core.SchemaDef
  verbose?: boolean
}): string => {
  const keyMessage = `Found problems in ${errors.length} of ${documentCount} documents.`
  const topMessage = shouldFail ? `Error: ${keyMessage}` : `Warning: ${keyMessage} Skipping those documents.`
  const asciiTree = new AsciiTree(topMessage + '\n')

  const uniqueErrorTags = Array.from(new Set(errors.map((e) => e._tag)))

  for (const tag of uniqueErrorTags) {
    const taggedErrors = errors.filter((e) => e._tag === tag)

    let str = ''

    const errorPrintLimit = verbose ? taggedErrors.length : 20
    const remainingErrorCount = Math.max(taggedErrors.length - errorPrintLimit, 0)
    str += taggedErrors[0]!.renderHeadline({
      documentCount: taggedErrors.length,
      options,
      schemaDef,
    })

    str += '\n\n'

    str += taggedErrors
      .splice(0, errorPrintLimit)
      .map((_: any) => `• ${_.renderLine()}`)
      .join('\n')

    if (remainingErrorCount > 0) {
      str += '\n'
      str += `• ... ${remainingErrorCount} more documents (Use the --verbose CLI option to show all documents)`
    }
    str += '\n'

    asciiTree.add(new AsciiTree(str))
  }

  return asciiTree.toString()
}

const failOrSkip = ({
  errors,
  flags,
}: {
  errors: readonly FetchDataError.FetchDataError[]
  flags: Flags
}): 'fail' | 'skip' => {
  if (errors.some((_) => _.kind === 'ExtraFieldData') && flags.onExtraFieldData === 'fail') {
    return 'fail'
  }

  if (errors.some((_) => _.kind === 'UnknownDocument') && flags.onUnknownDocuments === 'fail') {
    return 'fail'
  }

  if (errors.some((_) => _.kind === 'MissingOrIncompatibleData') && flags.onMissingOrIncompatibleData === 'fail') {
    return 'fail'
  }

  return errors.some((_) => _.kind === 'Unexpected') ? 'fail' : 'skip'
}

const filterErrorsByFlags = ({
  errors,
  flags,
}: {
  errors: readonly FetchDataError.FetchDataError[]
  flags: Flags
}): readonly FetchDataError.FetchDataError[] =>
  errors.filter((e) => {
    if (e.kind === 'ExtraFieldData' && flags.onExtraFieldData === 'ignore') return false
    if (e.kind === 'UnknownDocument' && flags.onUnknownDocuments === 'skip-ignore') return false
    if (e.kind === 'MissingOrIncompatibleData' && flags.onMissingOrIncompatibleData === 'skip-ignore') return false
    return true
  })
