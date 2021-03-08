import SantityImageUrlBuilder from '@sanity/image-url'
import { ImageUrlBuilder } from '@sanity/image-url/lib/types/builder'
import type { FetchDataFn } from '@sourcebit/sdk'
import { getSanityClient } from './sanity-client'

export const fetchData: FetchDataFn = async (studioDirPath: string) => {
  const client = await getSanityClient(studioDirPath)

  const imageUrlBuilder = SantityImageUrlBuilder(client)

  const entries: any[] = await client.fetch('*[]')
  const entriesById = entries
    .filter((_) => !_._id.startsWith('image'))
    .filter((_) => _._id)
    .map((_) => transformDataRec(_, imageUrlBuilder))
  // .reduce((result, entry) => ({ ...result, [entry._id]: transformDataRec(entry) }), {})
  const { promises: fs } = await import('fs')
  fs.writeFile(`result.json`, JSON.stringify({ documents: entriesById }, null, 2))
  console.log(entriesById)
  return '' as any
}

/** Recursively transforms Sanity response data into the data shape Sourcebit expects */
function transformDataRec(item: any, imageUrlBuilder: ImageUrlBuilder): any {
  const newItem = {
    // TODO remove
    type: item._type,
    __meta: {
      typeName: item._type,
      sanity: {} as any,
    },
  } as any

  for (const key in item) {
    if (key === 'slug') {
      newItem.__computed = { urlPath: item.slug.current }
    } else if (key.startsWith('_')) {
      newItem.__meta.sanity[key] = item[key]
    } else {
      newItem[key] = item[key]
      if (Array.isArray(newItem[key])) {
        newItem[key] = newItem[key].map((_: any) => transformDataRec(_, imageUrlBuilder))
      } else if (typeof newItem[key] === 'object') {
        if (newItem[key]._type === 'image') {
          newItem[key] = imageUrlBuilder.image(newItem[key]).url()
        } else {
          newItem[key] = transformDataRec(newItem[key], imageUrlBuilder)
        }
      }
    }
  }

  return newItem
}

// TODO handle refs
/*
    "author": {
      "__meta": {
        "typeName": "reference",
        "sanity": {
          "_ref": "5e67beac-bd76-4103-a6ee-04bb7120aec1",
          "_type": "reference"
        }
      }
    },

*/
