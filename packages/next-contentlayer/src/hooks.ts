import { addMessageListener } from 'next/dist/client/dev/error-overlay/eventsource'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

// Needed as a work around for https://github.com/vercel/next.js/issues/19230
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
