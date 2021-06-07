import { AppProps } from 'next/app'
import React from 'react'
import '../sass/main.scss'

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
