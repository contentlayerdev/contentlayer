// TODO move this code into another package so contentlayer is Stackbit agnostic
// probably will require namespace/declaration merging
export namespace StackbitExtension {
  export type Extension = {
    fieldGroups: FieldGroup[]
    fields: Record<string, FieldExtension>
  }

  export type FieldGroup = {
    name: string
    label: string
  }

  export type FieldExtension = {
    /** @default "content" */
    group?: string
    control?: Control
  }

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
