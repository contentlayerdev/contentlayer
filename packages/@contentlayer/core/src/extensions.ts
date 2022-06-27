declare global {
  // TODO docs
  interface ContentlayerExtensions {
    // [extensionName: string]: {
    //   root: never
    //   documentType: never
    //   nestedType: never
    //   field: never
    // }
  }
}

export type ExtensionsRoot = { [K in keyof ContentlayerExtensions]: ContentlayerExtensions[K]['root'] }
export type ExtensionsDocumentType = { [K in keyof ContentlayerExtensions]: ContentlayerExtensions[K]['documentType'] }
export type ExtensionsNestedType = { [K in keyof ContentlayerExtensions]: ContentlayerExtensions[K]['nestedType'] }
export type ExtensionsField = { [K in keyof ContentlayerExtensions]: ContentlayerExtensions[K]['field'] }
