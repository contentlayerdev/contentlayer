import type { GetFieldNamesForDefinitionGen } from '../gen.js'

type KnownFieldNames<DefName extends string> = GetFieldNamesForDefinitionGen<DefName>

// TODO move this code into another package so contentlayer is Stackbit agnostic
// probably will require namespace/declaration merging
export namespace StackbitExtension {
  export type Config = {
    pagesDir?: string
    dataDir?: string
    dirPath?: string
  }

  /** Extends a document or object defintion with Stackbit specific properties */
  export type TypeExtension<DefName extends string = string> = {
    fieldGroups?: FieldGroup[]
    fields?: Partial<Record<KnownFieldNames<DefName>, FieldExtension>> | Record<string, FieldExtension>
    /** the name of the field that will be used as a title of an object */
    labelField?: string
    label?: string
    folder?: string
    file?: string
    match?: string | string[]
  }

  export type FieldGroup = {
    name: string
    label: string
  }

  export type FieldExtension = {
    label?: string
    const?: any
    /** Users will not be able to edit hidden fields, therefore when hiding a field you should specify the default or const properties to populate these fields when new objects are created. */
    hidden?: boolean
    group?: string
    /** @default "content" */
    control?: Control
  }

  // TODO enum labels

  export type Control = ControlImageGallery | ControlColorPallete

  export type ControlImageGallery = {
    type: 'image-gallery'
    options: ControlImageGalleryOption
  }

  export type ControlImageGalleryOption = {}

  export type ControlColorPallete = {
    type: 'color-pallete'
    options: ControlColorPalleteOption[]
  }

  export type ControlColorPalleteOption = {
    value: string
    backgroundColor: string
    textColor?: string
    borderColor?: string
    borderRadius?: number
  }

  // export type ControlType = 'control-pallete' | 'dropdown' | 'horizontal-switch' | 'image-gallery'
  export type ControlType = Control['type']
}
