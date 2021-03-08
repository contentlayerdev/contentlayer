// Source https://gist.github.com/barbogast/4bea3ad77272fafe0af3d4f70446d037 from May 18, 2020
// via https://github.com/sanity-io/sanity/issues/1857#issuecomment-630241904
import { ReactComponentLike } from 'prop-types'
import { ReactElement } from 'react'

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
    list: { title: string; value: string }[]
    layout?: string
  }
}

export type NumberField = CommonFieldProps & {
  type: 'number'
}

export type BooleanField = CommonFieldProps & {
  type: 'boolean'
}

export type GeopointField = CommonFieldProps & {
  type: 'geopoint'
}

type TextField = CommonFieldProps & {
  type: 'text'
  rows: number
}

export type Span = {
  _type: 'span'
  text: string
}

export type BlockField = {
  // type: '???'
  _type: 'block'
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

type ArrayOf = ObjectType | ReferenceField | ImageField | { type: string } | BlockField

export type ArrayField = CommonFieldProps & {
  type: 'array'
  name: string
  of: ArrayOf[]
}

type FilterFunctionResult = { filter: string; filterParams?: string }
type FilterFunction = (args: {
  document: { [key: string]: any }
  parentPath: string[]
  parent: {}[]
}) => FilterFunctionResult
type ReferenceField = CommonFieldProps & {
  to: { type: string }[]
  options: {
    filter: string | FilterFunction
    filterParams?: { [key: string]: string }
  }
}

type ImageField = CommonFieldProps & {
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
  | CommonFieldProps
  | StringField
  | NumberField
  | NumberField
  | GeopointField
  | TextField
  | ArrayField
  | ReferenceField
  | ImageField
  | ObjectType
  | BlockField

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

export type Document = {
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
