import SantityImageUrlBuilder from '@sanity/image-url'
import { ImageUrlBuilder } from '@sanity/image-url/lib/types/builder'
import type * as Core from '@sourcebit/core'
import { getSanityClient } from './sanity-client'

export const fetchData = async ({
  studioDirPath,
  schemaDef,
}: {
  studioDirPath: string
  schemaDef: Core.SchemaDef
}): Promise<{ documents: Core.Document[] }> => {
  const client = await getSanityClient(studioDirPath)

  const imageUrlBuilder = SantityImageUrlBuilder(client)

  const entries: any[] = await client.fetch('*[]')

  ;(await import('fs')).writeFileSync('entries.json', JSON.stringify(entries, null, 2))

  const documents = entries
    .filter((_) => !_._id.startsWith('image'))
    .filter((_) => _._id)
    .map(transformDataRec(imageUrlBuilder))

  return { documents }
}

/** Recursively transforms Sanity response data into the data shape Sourcebit expects */
const transformDataRec = (imageUrlBuilder: ImageUrlBuilder) => (item: any): any => {
  const newItem = {
    // TODO remove
    type: item._type,
    __meta: {
      typeName: item._type,
      sanity: {} as any,
    },
  } as any

  for (const key in item) {
    if (key.startsWith('_')) {
      newItem.__meta.sanity[key] = item[key]
    } else {
      newItem[key] = item[key]
      if (Array.isArray(newItem[key])) {
        newItem[key] = newItem[key].map(transformDataRec(imageUrlBuilder))
      } else if (typeof newItem[key] === 'object') {
        if (newItem[key]._type === 'image') {
          newItem[key] = imageUrlBuilder.image(newItem[key]).url()
        } else {
          newItem[key] = transformDataRec(imageUrlBuilder)(newItem[key])
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
