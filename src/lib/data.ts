export type Cache = {
  documents: Document<SourcebitGen>
}

type Document<Data> = {}

declare global {
  // NOTE will be extended via `node_modules/@types/schemalayer-gen/index.d.ts`
  interface SourcebitGen {}
}

export function getDocumentsForUrl({}: { cache: Cache; url: string }) {}
export function getAllPaths({}: { cache: Cache }) {}
