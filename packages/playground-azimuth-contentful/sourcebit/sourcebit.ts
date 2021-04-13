import { makeSourcePlugin } from '@sourcebit/source-contentful'
import { defineConfig } from 'sourcebit/core'

export default defineConfig({
  source: makeSourcePlugin({
    accessToken: 'CFPAT-0rr1pfX__gDLyvVQsPbwdBnBQvta9AnqMiVx02twCTo',
    spaceId: 'rfcpfiludecf',
    environmentId: 'master',
  }),
})
