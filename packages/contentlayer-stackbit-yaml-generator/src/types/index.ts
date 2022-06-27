import type * as Stackbit from '@stackbit/sdk'

export type StackbitExtensionRoot = Partial<Omit<Stackbit.YamlConfig, 'models' | 'contentModels'>>

export type StackbitExtensionDocumentType = Omit<
  Stackbit.DataModel | Stackbit.PageModel,
  'fields' | 'name' | 'type'
> & {
  fields?: Record<string, StackbitExtensionField>
} & StackbitContentModelProps

type StackbitContentModelProps =
  | {
      isPage?: false | undefined
    }
  | {
      isPage: true
      urlPath?: string
      newFilePath?: string
      hideContent?: boolean
      singleInstance?: boolean
      file?: string
      folder?: string
      match?: string | string[]
      exclude?: string | string[]
    }
// {
//   fieldGroups?: FieldGroup[]
//   fields?: Record<string, StackbitExtensionField>
//   // fields?: Partial<Record<KnownFieldNames<DefName>, FieldExtension>> | Record<string, FieldExtension>
//   /** the name of the field that will be used as a title of an object */
//   labelField?: string
//   label?: string
//   folder?: string
//   file?: string
//   match?: string | string[]

//   groups?: string[]
// }

export type StackbitExtensionNestedType = Stackbit.ObjectModel

export type FieldGroup = {
  name: string
  label: string
}

// type KnownFieldNames<DefName extends string> = GetFieldNamesForDefinitionGen<DefName>

export type StackbitExtensionField = Omit<Stackbit.Field, 'type' | 'name' | 'default'> & {
  initialValue?: any
  /** Note only valid for type: string */
  isImage?: boolean
}

// & {
//   label?: string
//   const?: any
//   /** Users will not be able to edit hidden fields, therefore when hiding a field you should specify the default or const properties to populate these fields when new objects are created. */
//   hidden?: boolean
//   group?: string
//   /** @default "content" */
//   control?: Control
// }

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

export type StackbitExtension = {
  root: StackbitExtensionRoot
  documentType: StackbitExtensionDocumentType
  nestedType: StackbitExtensionDocumentType
  field: StackbitExtensionField
}

interface ContentlayerExtensionsStackbit {
  stackbit: StackbitExtension
}

declare global {
  interface ContentlayerExtensions extends ContentlayerExtensionsStackbit {}
}
