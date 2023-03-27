import Link from 'next/link'
import { allPosts, Post } from 'contentlayer/generated'

export default async function Home({ params }: { params: { tag: string } }) {
  return (
    <div className="py-8 mx-auto max-w-xl">
      <h1 className="mb-8 text-3xl font-bold text-center">Next.js docs</h1>
      <p className="">Branch/Tag: static</p>

      {allPosts.map((post, idx) => (
        <div key={idx}>
          <Link href={'/' + post.url}>{post.url}</Link>
        </div>
        // <PostCard key={idx} {...post} />
      ))}
    </div>
  )
}
