import type * as core from '@contentlayer/core'
import { Tagged } from '@contentlayer/utils/effect'

export class ComputedValueError extends Tagged('ComputedValueError')<{
  readonly error: unknown
  readonly documentTypeDef: core.DocumentTypeDef
  readonly document: core.Document
}> {}
