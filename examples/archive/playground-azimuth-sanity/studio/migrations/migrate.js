/* eslint-disable no-console */
import client from 'part:@sanity/base/client'

const fetchDocuments = () => client.fetch(`*[defined(slug)][0...100] {_id, _rev, slug}`)

const buildPatches = (docs) =>
  docs.map((doc) => ({
    id: doc._id,
    patch: {
      set: { url_path: doc.slug },
      unset: ['slug'],
      // this will cause the migration to fail if any of the documents has been
      // modified since it was fetched.
      ifRevisionID: doc._rev,
    },
  }))

const createTransaction = (patches) =>
  patches.reduce((tx, patch) => tx.patch(patch.id, patch.patch), client.transaction())

const commitTransaction = (tx) => tx.commit()

const migrateNextBatch = async () => {
  const documents = await fetchDocuments()
  const patches = buildPatches(documents)
  if (patches.length === 0) {
    console.log('No more documents to migrate!')
    return null
  }
  console.log(
    `Migrating batch:\n %s`,
    patches.map((patch) => `${patch.id} => ${JSON.stringify(patch.patch)}`).join('\n'),
  )
  const transaction = createTransaction(patches)
  await commitTransaction(transaction)
  return migrateNextBatch()
}

migrateNextBatch().catch((err) => {
  console.error(err)
  process.exit(1)
})
