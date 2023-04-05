import { fetchContent } from 'contentlayer/generated'

export const generateMetadata = async ({ params }: { params: { tag: string; slug: string[] } }) => {
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

  return {
    title: post?.url,
  }
}

const PostLayout = async ({ params }: { params: { slug: string[]; tag: string } }) => {
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

  if (post === undefined) {
    return <div>Post not found ({slug})</div>
  }

  return (
    <article className="py-8 mx-auto max-w-xl">
      <div className="mb-8 text-center">
        <h1>{post.url}</h1>
      </div>
      <div dangerouslySetInnerHTML={{ __html: post.body.html }} />
    </article>
  )
}

export default PostLayout
