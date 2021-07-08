// import { defineDocument, fromLocalContent } from 'contentlayer/source-local'

test.todo('generate-types')

export {}

// import { buildSource } from '../../src'

// export const post = defineDocument(() => ({
//   name: 'Post',
//   filePathPattern: `**/*.md`,
//   fields: {
//     title: {
//       type: 'string',
//       description: 'The title of the post',
//       required: true,
//     },
//     date: {
//       type: 'date',
//       description: 'The date of the post',
//       required: true,
//     },
//   },
//   computedFields: {
//     slug: { type: 'string', resolve: (_) => _._id.replace('.md', '') },
//   },
// }))

// // TODO rewrite test for gendotpkg
// describe('generate-types', () => {
//   test('simple schema', async () => {
//     const schema = await fromLocalContent({ schema: [post], contentDirPath: '' }).then((_) => _.provideSchema())
//     const typeSource = buildSource(schema)
//     expect(typeSource).toMatchSnapshot()
//   })
// })
