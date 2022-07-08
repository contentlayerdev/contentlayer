import type { GetDocumentTypeNamesGen } from '@contentlayer/core'
import type * as SourceFiles from '@contentlayer/source-files'
import { defineDocumentType } from '@contentlayer/source-files'

// TODO change back to function expression once fixed https://github.com/microsoft/TypeScript/issues/37151#issuecomment-756232934

/**
 *
 * @example
 * ```ts
 * import { makeSource } from 'contentlayer/source-files'
 * import { addComputedFields, stackbitConfigToDocumentTypes } from '@contentlayer/source-files-stackbit'
 * import stackbitConfig from './stackbit.config.js'
 *
 * const documentTypes = stackbitConfigToDocumentTypes(stackbitConfig)
 *
 * addComputedFields({
 *   documentTypes,
 *   documentTypeName: 'Page',
 *   computedFields: {
 *     slug: { type: 'string', resolve: (_) => _._raw.flattenedPath.replace(/^pages\/?/, '/') },
 *     __id: { type: 'string', resolve: (_) => 'content/' + _._id },
 *   },
 * })
 *
 * export default makeSource({ contentDirPath: 'content', documentTypes })
 * ```
 */
export function addComputedFields<DefName extends GetDocumentTypeNamesGen>({
  documentTypes,
  documentTypeName,
  computedFields,
}: {
  documentTypes: SourceFiles.DocumentType[]
  documentTypeName: DefName
  computedFields: SourceFiles.ComputedFields<DefName>
}): void {
  const documentType = documentTypes.find((_) => _.def().name === documentTypeName)

  if (!documentType) {
    throw new Error(`Document type "${documentTypeName}" not found`)
  }

  const previousDef = documentType.def()
  documentType.def = defineDocumentType(() => ({ ...previousDef, computedFields })).def
}
