import { fetchContent } from 'contentlayer/generated'

export default async function Head({ params }: { params: { tag: string; slug: string[] } }) {
  const contentResult = await fetchContent(params.tag)

  if (contentResult._tag === 'Error') {
    return (
      <div className="bg-red-600 text-white">
        <h1 className="text-3xl font-bold text-center">Error</h1>
        <pre>{JSON.stringify(contentResult.error, null, 2)}</pre>
      </div>
    )
  }

  const { allPosts } = contentResult.data
  const slug = params.slug.join('/')
  const post = allPosts.find((post) => post._raw.flattenedPath === slug)

  return (
    <>
      <title>{post?.url}</title>
    </>
  )
}
