import type * as core from '@contentlayer/core'
import { AsciiTree } from '@contentlayer/utils'
import { Tagged } from '@contentlayer/utils/effect'

import type { Flags } from '../types'
import type { FetchDataError, RenderHeadline } from '.'

export class FetchDataAggregateError extends Tagged('FetchDataAggregateError')<{
  readonly errors: readonly FetchDataError[]
  readonly documentCount: number
  readonly options: core.PluginOptions
  readonly flags: Flags
  readonly schemaDef: core.SchemaDef
  readonly verbose?: boolean
}> {
  toString = () => {
    const shouldFail = this.shouldFail()
    const keyMessage = `Found problems in ${this.errors.length} of ${this.documentCount} documents.`
    const topMessage = shouldFail ? `Error: ${keyMessage}` : `${keyMessage} Skipping those documents.`
    const asciiTree = new AsciiTree(topMessage + '\n')

    const uniqueErrorTags = Array.from(new Set(this.errors.map((e) => e._tag)))

    for (const tag of uniqueErrorTags) {
      const filteredErrors = this.errors.filter((e) => e._tag === tag)

      let str = ''

      const renderHeadline = (filteredErrors[0]!.constructor as any).renderHeadline as RenderHeadline | undefined
      const hasRenderLine = filteredErrors.every((_: any) => typeof _.renderLine === 'function')

      if (hasRenderLine && renderHeadline) {
        const errorPrintLimit = this.verbose ? filteredErrors.length : 20
        const remainingErrorCount = Math.max(filteredErrors.length - errorPrintLimit, 0)
        str += renderHeadline({
          documentCount: filteredErrors.length,
          options: this.options,
          schemaDef: this.schemaDef,
        })

        str += '\n\n'

        str += filteredErrors
          .splice(0, errorPrintLimit)
          .map((_: any) => `• ${_.renderLine()}`)
          .join('\n')

        if (remainingErrorCount > 0) {
          str += '\n'
          str += `• ... ${remainingErrorCount} more documents (Use the --verbose CLI option to show all documents)`
        }
        str += '\n'
      } else {
        str += filteredErrors.map((e) => e.toString()).join('\n')
        str += '\n'
      }

      asciiTree.add(new AsciiTree(str))
    }

    // let str = ''
    // const unknownDocumentErrors = this.errors.filter(
    //   (_): _ is CouldNotDetermineDocumentTypeError => _._tag === 'CouldNotDetermineDocumentTypeError',
    // )
    // const errorPrintLimit = this.verbose ? unknownDocumentErrors.length : 20
    // const remainingErrorCount = Math.max(unknownDocumentErrors.length - errorPrintLimit, 0)
    // // str += symbol + ' '
    // str += CouldNotDetermineDocumentTypeError.renderHeadline({
    //   documentCount: unknownDocumentErrors.length,
    //   options: this.options,
    //   schemaDef: this.schemaDef,
    // })
    // str += '\n'
    // str += unknownDocumentErrors
    //   .splice(0, errorPrintLimit)
    //   .map((_) => indentBy2(_.renderLine()))
    //   .join('\n')
    // if (remainingErrorCount > 0) {
    //   str += '\n'
    //   str += indentBy2(`+ ${remainingErrorCount} more documents (Use the --verbose CLI option to show all documents)`)
    // }

    // asciiTree.add(new AsciiTree(str))

    return asciiTree.toString()
  }

  private shouldFail = (): boolean => {
    const hasExtraFieldData = this.errors.some((_) => _._tag === 'ExtraFieldDataError')
    if (hasExtraFieldData && this.flags.onExtraFieldData === 'fail') {
      return true
    }

    const hasUnknownDocuments = this.errors.some((_) => _._tag === 'CouldNotDetermineDocumentTypeError')
    if (hasUnknownDocuments && this.flags.onUnknownDocuments === 'fail') {
      return true
    }

    const hasMissingOrIncompatibleData = this.errors.some(
      (_) =>
        _._tag === 'MissingRequiredFieldsError' ||
        _._tag === 'InvalidDataDuringMappingError' ||
        _._tag === 'NoSuchDocumentTypeError',
    )
    if (hasMissingOrIncompatibleData && this.flags.onMissingOrIncompatibleData === 'fail') {
      return true
    }

    return false
  }
}
