import { makeSourcePlugin } from '@contentlayer/source-contentful'
import { defineConfig } from 'contentlayer/core'

export default defineConfig({
  source: makeSourcePlugin({
    accessToken: 'CFPAT-0rr1pfX__gDLyvVQsPbwdBnBQvta9AnqMiVx02twCTo',
    spaceId: 'rfcpfiludecf',
    environmentId: 'master',
  }),
})
