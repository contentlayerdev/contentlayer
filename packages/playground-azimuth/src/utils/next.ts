import { SourcebitClient } from '@sourcebit/client'
import { GetServerSideProps, GetStaticPaths, GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
const { hash } = require('../sourcebit.json')

/** Needed in combination with `InferGetServerSidePropsType` */
export function defineServerSideProps<Fn extends GetServerSideProps>(fn: Fn): Fn {
  return fn
}

/** Needed in combination with `InferGetStaticPropsType` */
export function defineStaticProps<Fn extends GetStaticProps>(fn: Fn): Fn {
  return fn
}

export function defineStaticPaths<Fn extends GetStaticPaths>(fn: Fn): Fn {
  return fn
}

export function toParams(path: string): { params: { slug: string[] } } {
  return { params: { slug: path.split('/') } }
}

export function notUndefined<T>(_: T | undefined): _ is T {
  return _ !== undefined
}

export const SourcebitContext = React.createContext<SourcebitClient>(null as any)
export const useSourcebit = () => React.useContext(SourcebitContext)

export const useContentLiveReload = () => {
  const router = useRouter()
  const [cacheHash, setCacheHash] = useState(hash)
  useEffect(() => {
    if (cacheHash !== hash) {
      router.replace(router.asPath)
      setCacheHash(hash)
    }
  }, [cacheHash, hash])
}
