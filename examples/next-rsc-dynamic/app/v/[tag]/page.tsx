import Link from 'next/link'
import { compareDesc, format, parseISO } from 'date-fns'
import { fetchContent, Post } from 'contentlayer/generated'

export default async function Home({ params }: { params: { tag: string } }) {
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

  return (
    <div className="py-8 mx-auto max-w-xl">
      <h1 className="mb-8 text-3xl font-bold text-center">Next.js docs</h1>
      <p className="">Branch/Tag: {params.tag}</p>

      {allPosts.map((post, idx) => (
        <div key={idx}>
          <Link href={'v/' + params.tag + '/' + post.url}>{post.url}</Link>
        </div>
        // <PostCard key={idx} {...post} />
      ))}
    </div>
  )
}
