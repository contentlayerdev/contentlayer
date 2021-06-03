import type { FieldDef } from 'contentlayer/source-local'
import { defineDocument, fromLocalContent } from 'contentlayer/source-local'
import * as path from 'path'

const fields: Record<string, FieldDef> = {
  title: {
    type: 'string',
  },
}

const Reference = defineDocument(() => ({
  name: 'Reference',
  filePathPattern: 'docs/reference/**/*.md',
  fields,
}))

const HowTo = defineDocument(() => ({
  name: 'HowTo',
  filePathPattern: 'docs/how-to/**/*.md',
  fields,
}))

const Conceptual = defineDocument(() => ({
  name: 'Conceptual',
  filePathPattern: 'docs/conceptual/**/*.md',
  fields,
}))

const Tutorial = defineDocument(() => ({
  name: 'Tutorial',
  filePathPattern: 'tutorial/**/*.md',
  fields,
}))

export default fromLocalContent({
  contentDirPath: path.join(process.cwd(), 'gatsby', 'docs'),
  schema: [Reference, HowTo, Conceptual, Tutorial],
})
