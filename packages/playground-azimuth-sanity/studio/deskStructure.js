import S from "@sanity/desk-tool/structure-builder";

export default () =>
    S.list()
        .title("Content")
        .items([
            S.listItem()
                .title('Site Settings')
                .child(
                    S.document()
                        .schemaType('site_config')
                        .documentId('site_config')
                ),
            S.divider(),
            ...S.documentTypeListItems().filter(item => !['site_config'].includes(item.getId()))
        ]);
