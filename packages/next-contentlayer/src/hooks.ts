import { addMessageListener } from 'next/dist/client/dev/error-overlay/eventsource'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export const useLiveReload = () => {
  const router = useRouter()
  useEffect(() => {
    let lastBuiltHash: string | undefined
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
