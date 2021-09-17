import { errorToString } from '@contentlayer/utils'
import { Tagged } from '@contentlayer/utils/effect'

export class UnknownContentfulError extends Tagged('UnknownContentfulError')<{ readonly error: unknown }> {
  toString = () => `UnknownContentfulError: ${errorToString(this.error)}`
}
