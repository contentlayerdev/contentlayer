import S from '@sanity/desk-tool/structure-builder'

export default () =>
  S.list()
    .title('Content')
    .items([
      S.listItem().title('Site Settings').child(S.document().schemaType('config').documentId('config')),
      S.divider(),
      ...S.documentTypeListItems().filter((item) => !['config'].includes(item.getId())),
    ])
