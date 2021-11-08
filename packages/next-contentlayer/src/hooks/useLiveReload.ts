import { addMessageListener } from 'next/dist/client/dev/error-overlay/websocket.js'
import { useRouter } from 'next/router.js'
import { useEffect } from 'react'

/**
 * Needed as a work around for https://github.com/vercel/next.js/issues/19230
 * Just needed in casese where you're importing from `.contentlayer/data` and use the data directly in your
 * React components without going through `getStaticProps` or `getServerSideProps` first.
 */
export const useLiveReload = () => {
  const router = useRouter()
  useEffect(() => {
    let lastBuiltHash: string | undefined

    // Based on this "implementation detail"
    // https://github.com/vercel/next.js/blob/canary/packages/next/client/dev/error-overlay/eventsource.js
    addMessageListener((e: any) => {
      if (e.type === 'message' && typeof e.data === 'string') {
        const data = JSON.parse(e.data)
        // console.log({ data, lastBuiltHash })

        if ((data.action === 'built' || data.action === 'sync') && data.hash !== lastBuiltHash) {
          if (lastBuiltHash !== undefined) {
            router.replace(router.asPath)
          }

          lastBuiltHash = data.hash
        }
      }
    })
    /* eslint-disable react-hooks/exhaustive-deps */
  }, [])
}
