import { errorToString } from '@contentlayer/utils'
import { Tagged } from '@contentlayer/utils/effect'

export class NoConfigFoundError extends Tagged('NoConfigFoundError')<{
  readonly configPath?: string
  readonly cwd: string
}> {
  toString = () =>
    this.configPath
      ? `Couldn't find ${this.configPath}`
      : `Could not find contentlayer.config.ts or contentlayer.config.js in ${this.cwd}`
}

export class ConfigReadError extends Tagged('ConfigReadError')<{
  readonly configPath: string
  readonly error: unknown
}> {
  toString = () => `ConfigReadError (${this.configPath}): ${errorToString(this.error)}`
}

export class ConfigNoDefaultExportError extends Tagged('ConfigNoDefaultExportError')<{
  readonly configPath: string
  readonly availableExports: string[]
}> {}

export class SourceFetchDataError extends Tagged('SourceFetchDataError')<{
  readonly error: any
  alreadyHandled: boolean
}> {
  toString = () => `SourceFetchDataError: ${errorToString(this.error)}`
  toJSON = () => ({ _tag: this._tag, error: errorToString(this.error), alreadyHandled: this.alreadyHandled })
  static fromJSON = (json: any) => new SourceFetchDataError({ error: json.error, alreadyHandled: json.alreadyHandled })
}

export type SourceFetchDataErrorJSON = ReturnType<SourceFetchDataError['toJSON']>

export const isSourceFetchDataError = (_: any): _ is SourceFetchDataError =>
  _.hasOwnProperty('_tag') && _._tag === 'SourceFetchDataError'

export class SourceProvideSchemaError extends Tagged('SourceProvideSchemaError')<{
  readonly error: any
}> {
  toString = () => `SourceProvideSchemaError: ${errorToString(this.error)}`
  toJSON = () => ({ _tag: this._tag, error: errorToString(this.error) })
  static fromJSON = (json: any) => new SourceProvideSchemaError({ error: json.error })
}

export type SourceProvideSchemaErrorJSON = ReturnType<SourceProvideSchemaError['toJSON']>

/**
 * This error is triggered for inconsistent data according to the provided error flags by the user.
 * The error was already handled (i.e. logged to the console) so it can be ignored in the application entry points.
 *
 * NOTE the modeling of this error handling should probably still be improved further.
 */
export class HandledFetchDataError extends Tagged('HandledFetchDataError')<{}> {}

export class EsbuildBinNotFoundError extends Tagged('EsbuildBinNotFoundError')<{}> {}

export class SuccessCallbackError extends Tagged('SuccessCallbackError')<{
  readonly error: any
}> {
  toString = () => `SuccessCallbackError: ${errorToString(this.error)}`
}
