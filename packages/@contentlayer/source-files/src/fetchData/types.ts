export type RawContent = RawContentMarkdown | RawContentMDX | RawContentJSON | RawContentYAML

export interface RawContentMarkdown {
  readonly kind: 'markdown'
  fields: Record<string, any>
  body: string
  rawDocumentContent: string
}

export interface RawContentMDX {
  readonly kind: 'mdx'
  fields: Record<string, any>
  body: string
  rawDocumentContent: string
}

export interface RawContentJSON {
  readonly kind: 'json'
  fields: Record<string, any>
}

export interface RawContentYAML {
  readonly kind: 'yaml'
  fields: Record<string, any>
}
