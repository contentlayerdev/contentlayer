import { DocumentGen } from '@contentlayer/core'
import * as React from 'react'

export const ContentlayerContext = React.createContext<DocumentGen[]>(null as any)

export const useContentlayer = <Result = DocumentGen[]>(
  fn?: (docs: DocumentGen[]) => Result,
  deps?: React.DependencyList,
): Result => {
  const docs = React.useContext(ContentlayerContext)

  if (fn !== undefined) {
    return React.useMemo(() => {
      return fn(docs)
    }, deps)
  }

  return docs as any
}
