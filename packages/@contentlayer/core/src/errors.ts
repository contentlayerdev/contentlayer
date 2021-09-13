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
}> {}

export class ConfigNoDefaultExportError extends Tagged('ConfigNoDefaultExportError')<{
  readonly configPath: string
  readonly availableExports: string[]
}> {}

export class SourceFetchDataError extends Tagged('SourceFetchDataError')<{
  readonly error: any
}> {
  toString = () => `SourceFetchDataError: ${this.error.toString()}`
}

export class SourceProvideSchemaError extends Tagged('SourceProvideSchemaError')<{
  readonly error: any
}> {
  toString = () => `SourceProvideSchemaError: ${this.error.toString()}`
}
