import * as crypto from 'crypto'

// From https://gist.github.com/un33k/db8f0f804d50f671be7ca6663bef1969
export const hashObject = (object: any): string => {
  const hash = crypto
    .createHash('md5')
    .update(
      JSON.stringify(object, (k, v) => {
        if (k[0] === '_') return undefined
        // remove api stuff
        else if (typeof v === 'function')
          // consider functions
          return v.toString()
        else return v
      }),
    )
    .digest('hex')
  return hash
}
