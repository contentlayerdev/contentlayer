import matter from 'gray-matter'
import remark from 'remark'
import html from 'remark-html'

export const markdownToHtml = async (mdString: string): Promise<string> => {
  const matterResult = matter(mdString)

  // Use remark to convert markdown into HTML string
  const processedContent = await remark().use(html).process(matterResult.content)

  return processedContent.toString()
}
