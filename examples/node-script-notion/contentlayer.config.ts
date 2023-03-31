import { makeSource, defineDatabase } from 'contentlayer-source-notion'

export const Post = defineDatabase(() => ({
  name: 'Post',
  databaseId: 'fe26b972ec3f4b32a1882230915fe111',
}))

export default makeSource({
  clientOptions: {
    auth: process.env.NOTION_TOKEN,
  },
  databaseTypes: [Post],
})
