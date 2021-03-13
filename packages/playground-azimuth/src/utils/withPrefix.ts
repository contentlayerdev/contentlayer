import _ from 'lodash'
import { Image } from 'sourcebit/core'

export default function withPrefix(url: Image | undefined, pathPrefix: string = '/'): string | undefined {
  if (!url) {
    return url
  }

  if (_.startsWith(url, '#') || _.startsWith(url, 'http://') || _.startsWith(url, 'https://')) {
    return url
  }

  const basePath = _.trim(pathPrefix, '/')
  return '/' + _.compact([basePath, _.trimStart(url, '/')]).join('/')
}
