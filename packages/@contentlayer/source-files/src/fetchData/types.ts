export type RawContent = RawContentMarkdown | RawContentMDX | RawContentJSON | RawContentYAML

export type RawContentMarkdown = {
  readonly kind: 'markdown'
  fields: Record<string, any>
  body: string
  rawDocumentContent: string
}

export type RawContentMDX = {
  readonly kind: 'mdx'
  fields: Record<string, any>
  body: string
  rawDocumentContent: string
}

export type RawContentJSON = {
  readonly kind: 'json'
  fields: Record<string, any>
}

export type RawContentYAML = {
  readonly kind: 'yaml'
  fields: Record<string, any>
}
