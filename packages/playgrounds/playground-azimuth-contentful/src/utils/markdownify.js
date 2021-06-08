// export default function markdownify(markdown) {
//     if (!markdown) {
//         return null;
//     }
//     return htmlToReact(marked(markdown));
// };

export default function markdownify(markdown) {
  if (!markdown) {
    return null
  }
  return <div dangerouslySetInnerHTML={{ __html: markdown.html }} />
}
