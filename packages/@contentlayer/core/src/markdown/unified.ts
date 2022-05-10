import type * as Unified from 'unified'

import type { RawDocumentData } from '../data-types.js'

/**
 * Unified plugin that adds the raw document data to the vfile under `vfile.data.rawDocumentData`
 *
 * Contentlayer uses this plugin by default.
 */
export const addRawDocumentToVFile = (rawDocumentData: RawDocumentData) => (): Unified.Transformer => (_, vfile) => {
  Object.assign(vfile.data, { rawDocumentData })
}
