import { promises as fs } from 'node:fs'
import * as path from 'node:path'

import type { ClientConstructor, SanityClient } from '@sanity/client'
// NOTE sanity currently doesn't provide ESM exports, thus the require syntax is needed
// import * as SanityClient from '@sanity/client'
const SanityClient_: ClientConstructor = require('@sanity/client')

export async function getSanityClient(studioDirPath: string): Promise<SanityClient> {
  const sanityJsonData = await getSanityJsonData(studioDirPath)
  const { dataset, projectId } = sanityJsonData.api
  const client = new SanityClient_({ dataset, projectId, useCdn: false, apiVersion: '2021-03-25' })
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
