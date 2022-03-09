import '../styles/global.css'

export default function App({ Component, pageProps }) {
  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/@highlightjs/cdn-assets@11.0.0/styles/github.min.css" />
      <Component {...pageProps} />
    </>
  )
}
