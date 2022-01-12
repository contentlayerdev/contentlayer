// Source https://gist.github.com/barbogast/4bea3ad77272fafe0af3d4f70446d037 from May 18, 2020
// via https://github.com/sanity-io/sanity/issues/1857#issuecomment-630241904
import type { ReactComponentLike } from 'prop-types'
import type { ReactElement } from 'react'

type IsoDateTimeString = string

export type DataDocument = {
  _createdAt: IsoDateTimeString
  _id: string
  _rev: string
  _type: string
  _updatedAt: IsoDateTimeString
} & Record<string, any>

export type DataObject = {
  _type: string
} & Record<string, any>

type Meta = {
  parent: { [key: string]: any }
  path: string[]
  document: { [key: string]: any }
}

type CustomRuleCallback = (field: any, meta: Meta) => true | string | Promise<true | string>

export type RuleType = {
  required: () => RuleType
  custom: (cb: CustomRuleCallback) => RuleType
  min: (min: number) => RuleType
  max: (max: number) => RuleType
  length: (exactLength: number) => RuleType
  greaterThan: (gt: number) => RuleType
  uri: (options: { scheme: string[] }) => RuleType
}

type Validation = (rule: RuleType) => RuleType

type CommonFieldProps = {
  name: string
  title?: string
  fieldset?: string
  validation?: Validation
  description?: string
  hidden?: boolean
  readOnly?: boolean
  options?: {
    isHighlighted?: boolean // is only available on fields within an image
  }
  icon?: ReactComponentLike // is only available for elements of which include a block
}

export type StringField = CommonFieldProps & {
  type: 'string'
  options?: {
    // list: { title: string; value: string }[]
    list: string[]
    layout?: string
  }
}

export type NumberField = CommonFieldProps & {
  type: 'number'
}

export type BooleanField = CommonFieldProps & {
  type: 'boolean'
}

export type DateTimeField = CommonFieldProps & {
  type: 'datetime'
}

export type DateField = CommonFieldProps & {
  type: 'date'
}

export type UrlField = CommonFieldProps & {
  type: 'url'
}

export type SlugField = CommonFieldProps & {
  type: 'slug'
  options?: {
    source: string
  }
}

export type MarkdownField = CommonFieldProps & {
  type: 'markdown'
}

export type TextField = CommonFieldProps & {
  type: 'text'
  rows: number
}

export type Span = {
  type: 'span'
  text: string
}

export type BlockField = CommonFieldProps & {
  // type: '???'
  type: 'block'
  styles: {
    title: string
    value: string
    blockEditor?: {
      render: ReactComponentLike
    }
    icon?: ReactComponentLike
  }[]
  children: (Field | Span)[]
}

export type ArrayOf = InlineObjectField | ReferenceField | ImageField | BlockField | StringField

export type ArrayField = CommonFieldProps & { type: 'array'; name: string } & (
    | // enum array
    {
        of: [StringField]
        options?: {
          list: readonly string[]
        }
      }
    | { of: readonly ArrayOf[] }
  )

export const isArrayField = (_: Field): _ is ArrayField => _.type === 'array'

type FilterFunctionResult = { filter: string; filterParams?: string }
type FilterFunction = (args: {
  document: { [key: string]: any }
  parentPath: string[]
  parent: {}[]
}) => FilterFunctionResult
type ReferenceField = CommonFieldProps & {
  type: 'reference'
  to: { type: string }[]
  options: {
    filter: string | FilterFunction
    filterParams?: { [key: string]: string }
  }
}

export type ImageField = CommonFieldProps & {
  type: 'image'
  options?: {
    hotspot?: boolean
  }
}

/*
MISSING FIELD TYPES
- sanity.imageDimensions
- sanity.imagePalette
- sanity.imagePaletteSwatch
*/

export type Field =
  | StringField
  | NumberField
  | BooleanField
  | DateTimeField
  | DateField
  | UrlField
  | SlugField
  | TextField
  | MarkdownField
  | ArrayField
  | ReferenceField
  | ImageField
  | InlineObjectField
  | BlockField
// | ObjectField

// NOTE `ObjectField` is commented out since it otherwise breaks the string literal union tags for `type`
// type ObjectField = CommonFieldProps & {
//   type: string
// }

export type InlineObjectField = ObjectType

export type FieldType = Field['type']

type Preview = {
  select?: { [key: string]: string }
  prepare?: (selection: { [key: string]: any }) => { title?: string; subtitle?: string } // eslint-disable-line @typescript-eslint/no-explicit-any
  component?: (props: PreviewProps) => ReactElement
}

type Fieldset = {
  name: string
  title: string
  options?: { collapsible: boolean; collapsed?: boolean }
}

export type ObjectType = {
  type: 'object'
  title?: string
  name: string
  fields: Field[]
  validation?: Validation
  preview?: Preview
  fieldsets?: Fieldset[]
  description?: string
  options?: { collapsible?: boolean; collapsed?: boolean }
}

export type DocumentType = {
  type: 'document'
  name: string
  fields: Field[]
  title?: string
  validation?: Validation
  preview?: Preview
  fieldsets?: Fieldset[]
  initialValue?: { [key: string]: any } // eslint-disable-line @typescript-eslint/no-explicit-any
  orderings?: {
    name: string
    title: string
    by: { field: string; direction: string }[]
  }[]
}

export type PreviewProps = {
  value: {
    [key: string]: any
  }
}

export type Body2TextProps = { children: React.FunctionComponent<any> }
