import { makeSource, defineDatabase } from '@contentlayer/source-notion';
import * as notion from '@notionhq/client';

const client = new notion.Client({
    auth: process.env.NOTION_TOKEN
})

const Post = defineDatabase(() => ({
    name: 'Post',
    databaseId: 'fe26b972ec3f4b32a1882230915fe111',
    importContent: false,
    fields: {
        email: {
            label: 'Email',
            isRequired: true,
        }
    }
}))

export default makeSource({
    client,
    databaseTypes: [Post]
})