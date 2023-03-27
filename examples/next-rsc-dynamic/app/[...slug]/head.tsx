import { allPosts } from 'contentlayer/generated'

export default function Head({ params }: { params: { slug: string[] } }) {
  const slug = params.slug.join('/')
  const post = allPosts.find((post) => post._raw.flattenedPath === slug)

  return (
    <>
      <title>{post?.url}</title>
    </>
  )
}
