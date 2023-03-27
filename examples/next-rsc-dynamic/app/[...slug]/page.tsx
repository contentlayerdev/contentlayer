import { allPosts } from 'contentlayer/generated'

export const generateStaticParams = async () => allPosts.map((post) => ({ slug: post._raw.flattenedPath.split('/') }))

const PostLayout = async ({ params }: { params: { slug: string[]; tag: string } }) => {
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
