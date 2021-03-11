import SanityClient_, { SanityClient } from '@sanity/client'
import { promises as fs } from 'fs'
import * as path from 'path'

export async function getSanityClient(studioDirPath: string): Promise<SanityClient> {
  const sanityJsonData = await getSanityJsonData(studioDirPath)
  const { dataset, projectId } = sanityJsonData.api
  const client = new SanityClient_({ dataset, projectId, useCdn: false })
  return client
}

async function getSanityJsonData(studioDirPath: string): Promise<SanityJsonData> {
  const jsonPath = path.join(studioDirPath, 'sanity.json')
  const content = await fs.readFile(jsonPath, 'utf-8')
  return JSON.parse(content)
}

type SanityJsonData = {
  project: { name: string }
  api: {
    projectId: string
    dataset: string
  }
  plugins: string[]
  env: Record<string, any>
  parts: Part[]
}

type Part = { name: string; path: string }
