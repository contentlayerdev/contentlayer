import * as core from '@contentlayer/core'
import type { PosixFilePath } from '@contentlayer/utils'
import { AsciiTree } from '@contentlayer/utils'
import type { HasConsole } from '@contentlayer/utils/effect'
import { T } from '@contentlayer/utils/effect'

import type { Flags } from '../types.js'
import type { FetchDataError } from './index.js'

export const handleFetchDataErrors = ({
  errors,
  documentCount,
  options,
  flags,
  schemaDef,
  contentDirPath,
  verbose,
}: {
  errors: readonly FetchDataError.FetchDataError[]
  documentCount: number
  options: core.PluginOptions
  flags: Flags
  schemaDef: core.SchemaDef
  contentDirPath: PosixFilePath
  verbose?: boolean
}): T.Effect<HasConsole, core.HandledFetchDataError, void> =>
  T.gen(function* ($) {
    const filteredErrors = filterIgnoredErrorsByFlags({ errors, flags })

    if (filteredErrors.length === 0) return

    const shouldFail = failOrSkip({ errors: filteredErrors, flags }) === 'fail'

    const errorMessage = aggregateFetchDataErrors({
      documentCount,
      errors: filteredErrors,
      options,
      shouldFail,
      schemaDef,
      contentDirPath,
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
  contentDirPath,
  verbose,
}: {
  errors: readonly FetchDataError.FetchDataError[]
  documentCount: number
  options: core.PluginOptions
  flags: Flags
  schemaDef: core.SchemaDef
  contentDirPath: PosixFilePath
  verbose?: boolean
}): string | null => {
  const filteredErrors = filterIgnoredErrorsByFlags({ errors, flags })

  if (filteredErrors.length === 0) return null

  const shouldFail = failOrSkip({ errors: filteredErrors, flags }) === 'fail'

  return aggregateFetchDataErrors({
    documentCount,
    errors: filteredErrors,
    options,
    shouldFail,
    schemaDef,
    contentDirPath,
    verbose,
  })
}

const aggregateFetchDataErrors = ({
  errors,
  documentCount,
  options,
  shouldFail,
  schemaDef,
  contentDirPath,
  verbose,
}: {
  errors: readonly FetchDataError.FetchDataError[]
  documentCount: number
  options: core.PluginOptions
  shouldFail: boolean
  schemaDef: core.SchemaDef
  contentDirPath: PosixFilePath
  verbose?: boolean
}): string => {
  const keyMessage = `Found ${errors.length} problems in ${documentCount} documents.`
  const topMessage = shouldFail ? `Error: ${keyMessage}` : `Warning: ${keyMessage} Skipping those documents.`
  const asciiTree = new AsciiTree(topMessage + '\n')

  const uniqueErrorTags = Array.from(new Set(errors.map((e) => e._tag)))

  for (const tag of uniqueErrorTags) {
    const taggedErrors = errors.filter((e) => e._tag === tag)

    let str = ''

    const errorPrintLimit = verbose ? taggedErrors.length : 20
    const remainingErrorCount = Math.max(taggedErrors.length - errorPrintLimit, 0)
    str += taggedErrors[0]!.renderHeadline({
      errorCount: taggedErrors.length,
      options,
      schemaDef,
      contentDirPath,
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
  if (errors.some((_) => _.category === 'ExtraFieldData') && flags.onExtraFieldData === 'fail') {
    return 'fail'
  }

  if (errors.some((_) => _.category === 'UnknownDocument') && flags.onUnknownDocuments === 'fail') {
    return 'fail'
  }

  if (errors.some((_) => _.category === 'MissingOrIncompatibleData') && flags.onMissingOrIncompatibleData === 'fail') {
    return 'fail'
  }

  if (errors.some((_) => _.category === 'SingletonDocumentNotFound')) {
    return 'fail'
  }

  return errors.some((_) => _.category === 'Unexpected') ? 'fail' : 'skip'
}

const filterIgnoredErrorsByFlags = ({
  errors,
  flags,
}: {
  errors: readonly FetchDataError.FetchDataError[]
  flags: Flags
}): readonly FetchDataError.FetchDataError[] =>
  errors.filter((e) => {
    if (e.category === 'ExtraFieldData' && flags.onExtraFieldData === 'ignore') return false
    if (e.category === 'UnknownDocument' && flags.onUnknownDocuments === 'skip-ignore') return false
    if (e.category === 'MissingOrIncompatibleData' && flags.onMissingOrIncompatibleData === 'skip-ignore') return false
    return true
  })
