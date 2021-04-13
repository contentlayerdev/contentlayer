import { GetServerSideProps, GetStaticPaths, GetStaticProps } from 'next'
import React from 'react'
import { SourcebitClient } from 'sourcebit/client'

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
  return { params: { slug: path.replace(/^\//, '').split('/') } }
}

export function notUndefined<T>(_: T | undefined): _ is T {
  return _ !== undefined
}

export const SourcebitContext = React.createContext<SourcebitClient>(null as any)
export const useSourcebit = () => React.useContext(SourcebitContext)
