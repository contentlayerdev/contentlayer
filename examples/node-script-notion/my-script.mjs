import { allPosts } from './.contentlayer/generated/index.mjs'

const postUrls = allPosts.map(post => post.url)

console.log(`Found ${postUrls.length} posts:`);
console.log(postUrls)
