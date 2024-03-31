import { errorToString } from '@contentlayer2/utils'
import { Tagged } from '@contentlayer2/utils/effect'

export class UnknownContentfulError extends Tagged('UnknownContentfulError')<{ readonly error: unknown }> {
  toString = () => `UnknownContentfulError: ${errorToString(this.error)}`
}
