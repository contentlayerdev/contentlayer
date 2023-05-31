import type * as core from '@contentlayer/core'
import { unknownToAbsolutePosixFilePath } from '@contentlayer/utils'
import { expect, test } from 'vitest'

import { testOnly_aggregateFetchDataErrors as aggregateFetchDataErrors } from '../../errors/aggregate.js'
import type { Flags } from '../../types.js'
import { makeErrors, makeSchemaDef, makeSchemaWithSingletonDef } from './utils.js'

const typeFieldName = 'type'
const bodyFieldName = 'body'
const options: core.PluginOptions = {
  markdown: undefined,
  mdx: undefined,
  date: undefined,
  fieldOptions: { typeFieldName, bodyFieldName },
  disableImportAliasWarning: false,
  experimental: { enableDynamicBuild: false },
  onSuccess: undefined,
}
const flags: Flags = {
  onExtraFieldData: 'warn',
  onMissingOrIncompatibleData: 'skip-warn',
  onUnknownDocuments: 'skip-warn',
}
const schemaDef = makeSchemaDef()
const contentDirPath = unknownToAbsolutePosixFilePath('./content', unknownToAbsolutePosixFilePath(process.cwd()))

// TODO improve Vitest inline snapshots once fixed https://github.com/vitest-dev/vitest/issues/856

test('CouldNotDetermineDocumentTypeError: should print 4 errors', async () => {
  const errorString = aggregateFetchDataErrors({
    errors: makeErrors({ CouldNotDetermineDocumentTypeError: 4 }, schemaDef),
    options,
    flags,
    schemaDef,
    contentDirPath,
    documentCount: 42,
  })

  expect(errorString).toMatchInlineSnapshot(`
    "Warning: Found 4 problems in 42 documents.

     └── Couldn't determine the document type for 4 documents. (Skipping documents)
         
         Please either define a filePathPattern for the given document type definition or provide a valid value for the type field (i.e. the field \\"type\\" needs to be one of the following document type names: TypeA, TypeB).
         
         • docs/scaly_oblong_pro.md
         • docs/reorganization.md
         • docs/aw_shameful.md
         • docs/concerning_brilliant.md
         
    "
  `)
})

test('CouldNotDetermineDocumentTypeError: should print 24 errors - truncated', async () => {
  const errorString = aggregateFetchDataErrors({
    errors: makeErrors({ CouldNotDetermineDocumentTypeError: 24 }, schemaDef),
    options,
    flags,
    schemaDef,
    contentDirPath,
    documentCount: 81,
  })

  expect(errorString).toMatchInlineSnapshot(`
    "Warning: Found 24 problems in 81 documents.

     └── Couldn't determine the document type for 24 documents. (Skipping documents)
         
         Please either define a filePathPattern for the given document type definition or provide a valid value for the type field (i.e. the field \\"type\\" needs to be one of the following document type names: TypeA, TypeB).
         
         • docs/scaly_oblong_pro.md
         • docs/reorganization.md
         • docs/aw_shameful.md
         • docs/concerning_brilliant.md
         • docs/hexagon_recast_cheery.md
         • docs/exhausted.md
         • docs/notwithstanding.md
         • docs/like_pace_till.md
         • docs/tense.md
         • docs/around.md
         • docs/off_yum.md
         • docs/button_globalize.md
         • docs/phooey_naughty.md
         • docs/above_devise_ugh.md
         • docs/around.md
         • docs/rack_till_outnumber.md
         • docs/by_while.md
         • docs/strange.md
         • docs/promptly_banner.md
         • docs/curdle_mixture.md
         • ... 4 more documents (Use the --verbose CLI option to show all documents)
         
    "
  `)
})

test('CouldNotDetermineDocumentTypeError: should print 24 errors - full', async () => {
  const errorString = aggregateFetchDataErrors({
    errors: makeErrors({ CouldNotDetermineDocumentTypeError: 24 }, schemaDef),
    options,
    flags,
    schemaDef,
    contentDirPath,
    documentCount: 81,
    verbose: true,
  })

  expect(errorString).toMatchInlineSnapshot(`
    "Warning: Found 24 problems in 81 documents.

     └── Couldn't determine the document type for 24 documents. (Skipping documents)
         
         Please either define a filePathPattern for the given document type definition or provide a valid value for the type field (i.e. the field \\"type\\" needs to be one of the following document type names: TypeA, TypeB).
         
         • docs/scaly_oblong_pro.md
         • docs/reorganization.md
         • docs/aw_shameful.md
         • docs/concerning_brilliant.md
         • docs/hexagon_recast_cheery.md
         • docs/exhausted.md
         • docs/notwithstanding.md
         • docs/like_pace_till.md
         • docs/tense.md
         • docs/around.md
         • docs/off_yum.md
         • docs/button_globalize.md
         • docs/phooey_naughty.md
         • docs/above_devise_ugh.md
         • docs/around.md
         • docs/rack_till_outnumber.md
         • docs/by_while.md
         • docs/strange.md
         • docs/promptly_banner.md
         • docs/curdle_mixture.md
         • docs/absent.md
         • docs/whenever_ignorant.md
         • docs/identical.md
         • docs/discount_hopelessly.md
         
    "
  `)
})

test('CouldNotDetermineDocumentTypeError: should ignore the errors', async () => {
  const errorString = aggregateFetchDataErrors({
    errors: makeErrors({ CouldNotDetermineDocumentTypeError: 24 }, schemaDef),
    options,
    flags: { ...flags, onUnknownDocuments: 'skip-ignore' },
    schemaDef,
    contentDirPath,
    documentCount: 81,
    verbose: true,
  })

  expect(errorString).toBeNull()
})

test('MissingRequiredFieldsError: should print 4 warnings', async () => {
  const errorString = aggregateFetchDataErrors({
    errors: makeErrors({ MissingRequiredFieldsError: 4 }, schemaDef),
    options,
    flags,
    schemaDef,
    contentDirPath,
    documentCount: 42,
  })

  expect(errorString).toMatchInlineSnapshot(`
    "Warning: Found 4 problems in 42 documents.

     └── Missing required fields for 4 documents. (Skipping documents)
         
         • \\"docs/scaly_oblong_pro.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/reorganization.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/aw_shameful.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/concerning_brilliant.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         
    "
  `)
})

test('MissingRequiredFieldsError: should fail because of singleton', async () => {
  const schemaDef = makeSchemaWithSingletonDef()
  const errorString = aggregateFetchDataErrors({
    errors: makeErrors({ MissingRequiredFieldsError: 4 }, schemaDef),
    options,
    flags,
    schemaDef,
    contentDirPath,
    documentCount: 42,
  })

  expect(errorString).toMatchInlineSnapshot(`
    "Error: Found 4 problems in 42 documents.

     └── Missing required fields for 4 documents.
         
         • \\"docs/scaly_oblong_pro.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/reorganization.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/aw_shameful.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/concerning_brilliant.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         
    "
  `)
})

test('ExtraFieldDataError: should print warning', async () => {
  const errorString = aggregateFetchDataErrors({
    errors: makeErrors({ ExtraFieldDataError: 2 }, schemaDef),
    options,
    flags,
    schemaDef,
    contentDirPath,
    documentCount: 42,
  })

  expect(errorString).toMatchInlineSnapshot(`
    "Warning: Found 2 problems in 42 documents.

     └──   2 documents contain field data which isn't defined in the document type definition.
         
         • \\"docs/scaly_oblong_pro.md\\" of type \\"TypeB\\" has the following extra fields:
           • someKey: \\"someVal\\" 
         • \\"docs/reorganization.md\\" of type \\"TypeB\\" has the following extra fields:
           • someOtherKey: 42 
         
    "
  `)
})

test('ExtraFieldDataError: should print error', async () => {
  const errorString = aggregateFetchDataErrors({
    errors: makeErrors({ ExtraFieldDataError: 2 }, schemaDef),
    options,
    flags: { ...flags, onExtraFieldData: 'fail' },
    schemaDef,
    contentDirPath,
    documentCount: 42,
  })

  expect(errorString).toMatchInlineSnapshot(`
    "Error: Found 2 problems in 42 documents.

     └──   2 documents contain field data which isn't defined in the document type definition.
         
         • \\"docs/scaly_oblong_pro.md\\" of type \\"TypeB\\" has the following extra fields:
           • someKey: \\"someVal\\" 
         • \\"docs/reorganization.md\\" of type \\"TypeB\\" has the following extra fields:
           • someOtherKey: 42 
         
    "
  `)
})

test('MissingRequiredFieldsError: should print 24 errors - truncated', async () => {
  const errorString = aggregateFetchDataErrors({
    errors: makeErrors({ MissingRequiredFieldsError: 24 }, schemaDef),
    options,
    flags,
    schemaDef,
    contentDirPath,
    documentCount: 81,
  })

  expect(errorString).toMatchInlineSnapshot(`
    "Warning: Found 24 problems in 81 documents.

     └── Missing required fields for 24 documents. (Skipping documents)
         
         • \\"docs/scaly_oblong_pro.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/reorganization.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/aw_shameful.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/concerning_brilliant.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/hexagon_recast_cheery.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/exhausted.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/notwithstanding.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/like_pace_till.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/tense.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/around.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/off_yum.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/button_globalize.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/phooey_naughty.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/above_devise_ugh.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/around.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/rack_till_outnumber.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/by_while.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/strange.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/promptly_banner.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/curdle_mixture.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • ... 4 more documents (Use the --verbose CLI option to show all documents)
         
    "
  `)
})

test('mix of different errors: some', async () => {
  const errorString = aggregateFetchDataErrors({
    errors: makeErrors({ CouldNotDetermineDocumentTypeError: 4, NoSuchDocumentTypeError: 2 }, schemaDef),
    options,
    flags,
    schemaDef,
    contentDirPath,
    documentCount: 42,
  })

  expect(errorString).toMatchInlineSnapshot(`
    "Warning: Found 6 problems in 42 documents.

     ├── Couldn't determine the document type for 4 documents. (Skipping documents)
     │   
     │   Please either define a filePathPattern for the given document type definition or provide a valid value for the type field (i.e. the field \\"type\\" needs to be one of the following document type names: TypeA, TypeB).
     │   
     │   • docs/scaly_oblong_pro.md
     │   • docs/reorganization.md
     │   • docs/aw_shameful.md
     │   • docs/concerning_brilliant.md
     │   
     └── Couldn't find document type definitions provided by name for 2 documents. (Skipping documents)
         
         Please use one of the following document type names: TypeA, TypeB.
         
         • docs/hexagon_recast_cheery.md (Used type name: \\"TypeB\\")
         • docs/exhausted.md (Used type name: \\"TypeB\\")
         
    "
  `)
})

test('mix of different errors: with extra field data', async () => {
  const errorString = aggregateFetchDataErrors({
    errors: makeErrors(
      { CouldNotDetermineDocumentTypeError: 4, NoSuchDocumentTypeError: 2, ExtraFieldDataError: 1 },
      schemaDef,
    ),
    options,
    flags,
    schemaDef,
    contentDirPath,
    documentCount: 42,
  })

  expect(errorString).toMatchInlineSnapshot(`
    "Warning: Found 7 problems in 42 documents.

     ├── Couldn't determine the document type for 4 documents. (Skipping documents)
     │   
     │   Please either define a filePathPattern for the given document type definition or provide a valid value for the type field (i.e. the field \\"type\\" needs to be one of the following document type names: TypeA, TypeB).
     │   
     │   • docs/scaly_oblong_pro.md
     │   • docs/reorganization.md
     │   • docs/aw_shameful.md
     │   • docs/concerning_brilliant.md
     │   
     ├── Couldn't find document type definitions provided by name for 2 documents. (Skipping documents)
     │   
     │   Please use one of the following document type names: TypeA, TypeB.
     │   
     │   • docs/hexagon_recast_cheery.md (Used type name: \\"TypeB\\")
     │   • docs/exhausted.md (Used type name: \\"TypeB\\")
     │   
     └──   1 documents contain field data which isn't defined in the document type definition.
         
         • \\"docs/notwithstanding.md\\" of type \\"TypeB\\" has the following extra fields:
           • someKey: \\"someVal\\" 
         
    "
  `)
})

test('mix of different errors: other', async () => {
  const errorString = aggregateFetchDataErrors({
    errors: makeErrors(
      {
        CouldNotDetermineDocumentTypeError: 4,
        NoSuchDocumentTypeError: 2,
        ComputedValueError: 1,
        UnexpectedError: 2,
        MissingRequiredFieldsError: 3,
      },
      schemaDef,
    ),
    options,
    flags,
    schemaDef,
    contentDirPath,
    documentCount: 42,
  })

  expect(errorString).toMatchInlineSnapshot(`
    "Error: Found 12 problems in 42 documents.

     ├── Couldn't determine the document type for 4 documents. (Skipping documents)
     │   
     │   Please either define a filePathPattern for the given document type definition or provide a valid value for the type field (i.e. the field \\"type\\" needs to be one of the following document type names: TypeA, TypeB).
     │   
     │   • docs/scaly_oblong_pro.md
     │   • docs/reorganization.md
     │   • docs/aw_shameful.md
     │   • docs/concerning_brilliant.md
     │   
     ├── Couldn't find document type definitions provided by name for 2 documents. (Skipping documents)
     │   
     │   Please use one of the following document type names: TypeA, TypeB.
     │   
     │   • docs/hexagon_recast_cheery.md (Used type name: \\"TypeB\\")
     │   • docs/exhausted.md (Used type name: \\"TypeB\\")
     │   
     ├── Encountered unexpected errors while processing of 2 documents. This is possibly a bug in Contentlayer. Please open an issue.
     │   
     │   • \\"docs/notwithstanding.md\\": Error: Some problem happened: transmitting the transmitter won't do anything, we need to copy the online CLI pixel!
     │   • \\"docs/pace_till.md\\": Error: Some problem happened: Try to synthesize the RSS pixel, maybe it will generate the optical port!
     │   
     ├── Error during computed field exection for 1 documents. (Skipping documents)
     │   
     │   • \\"docs/colonial_tailspin_joke.md\\" failed with Error: Some problem happened: Use the multi-byte HDD panel, then you can hack the haptic port!
     │   
     └── Missing required fields for 3 documents. (Skipping documents)
         
         • \\"docs/mid_rural_justly.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/sans_gladly.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/ambitious_inasmuch.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         
    "
  `)
})
