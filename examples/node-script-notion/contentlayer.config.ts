import { makeSource, defineDatabase } from 'contentlayer-source-notion'
import * as notion from '@notionhq/client'

const client = new notion.Client({
  auth: process.env.NOTION_TOKEN,
})

const Category = defineDatabase(() => ({
  name: 'Category',
  databaseId: '8bf1821701f14ab8bbbfaad0309ed09c',
  importContent: false,
}))

const Post = defineDatabase(() => ({
  name: 'Post',
  databaseId: 'fe26b972ec3f4b32a1882230915fe111',
  properties: {
    email: {
      name: 'Email',
      required: true,
    },
    category: {
      type: 'relation',
      name: 'Category',
      relation: Category,
      single: true,
    },
  },
}))

export default makeSource({
  client,
  databaseTypes: [Post, Category],
})
