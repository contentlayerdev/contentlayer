import { errorToString } from '@contentlayer-temp/utils'
import { Tagged } from '@contentlayer-temp/utils/effect'

export class UnknownContentfulError extends Tagged('UnknownContentfulError')<{ readonly error: unknown }> {
  toString = () => `UnknownContentfulError: ${errorToString(this.error)}`
}
