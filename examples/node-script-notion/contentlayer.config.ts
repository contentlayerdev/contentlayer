import { makeSource, defineDatabase } from '@contentlayer/source-notion';

const Post = defineDatabase(() => ({
    name: 'Post',
    databaseId: 'fe26b972ec3f4b32a1882230915fe111'
}))

export default makeSource({
    internalIntegrationToken: process.env.NOTION_TOKEN as string,
    databaseTypes: [Post]
})