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
         
         • docs/killer_handcrafted_synthesize.md
         • docs/redundant_silver_card.md
         • docs/maryland_market.md
         • docs/content_steel_coordinator.md
         
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
         
         • docs/killer_handcrafted_synthesize.md
         • docs/redundant_silver_card.md
         • docs/maryland_market.md
         • docs/content_steel_coordinator.md
         • docs/rhenium_grocery.md
         • docs/northeast.md
         • docs/system_paradigm_hatchback.md
         • docs/degree_tin_bandwidth.md
         • docs/elegant_plight.md
         • docs/southeast_antillian_tan.md
         • docs/bulgarian.md
         • docs/dobra_safely_lie.md
         • docs/scsi_dicta.md
         • docs/target.md
         • docs/facilitator_hence.md
         • docs/online.md
         • docs/sleek_omani_missouri.md
         • docs/plum_forint_east.md
         • docs/account_truthful.md
         • docs/indexing.md
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
         
         • docs/killer_handcrafted_synthesize.md
         • docs/redundant_silver_card.md
         • docs/maryland_market.md
         • docs/content_steel_coordinator.md
         • docs/rhenium_grocery.md
         • docs/northeast.md
         • docs/system_paradigm_hatchback.md
         • docs/degree_tin_bandwidth.md
         • docs/elegant_plight.md
         • docs/southeast_antillian_tan.md
         • docs/bulgarian.md
         • docs/dobra_safely_lie.md
         • docs/scsi_dicta.md
         • docs/target.md
         • docs/facilitator_hence.md
         • docs/online.md
         • docs/sleek_omani_missouri.md
         • docs/plum_forint_east.md
         • docs/account_truthful.md
         • docs/indexing.md
         • docs/awesome_global_unleash.md
         • docs/wooden_health_dolorem.md
         • docs/circuit.md
         • docs/factors.md
         
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
         
         • \\"docs/killer_handcrafted_synthesize.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/redundant_silver_card.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/maryland_market.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/content_steel_coordinator.md\\" (of type \\"TypeB\\") is missing the following required fields:
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
         
         • \\"docs/killer_handcrafted_synthesize.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/redundant_silver_card.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/maryland_market.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/content_steel_coordinator.md\\" (of type \\"TypeB\\") is missing the following required fields:
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
         
         • \\"docs/killer_handcrafted_synthesize.md\\" of type \\"TypeB\\" has the following extra fields:
           • someKey: \\"someVal\\" 
         • \\"docs/redundant_silver_card.md\\" of type \\"TypeB\\" has the following extra fields:
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
         
         • \\"docs/killer_handcrafted_synthesize.md\\" of type \\"TypeB\\" has the following extra fields:
           • someKey: \\"someVal\\" 
         • \\"docs/redundant_silver_card.md\\" of type \\"TypeB\\" has the following extra fields:
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
         
         • \\"docs/killer_handcrafted_synthesize.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/redundant_silver_card.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/maryland_market.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/content_steel_coordinator.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/rhenium_grocery.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/northeast.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/system_paradigm_hatchback.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/degree_tin_bandwidth.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/elegant_plight.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/southeast_antillian_tan.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/bulgarian.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/dobra_safely_lie.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/scsi_dicta.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/target.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/facilitator_hence.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/online.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/sleek_omani_missouri.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/plum_forint_east.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/account_truthful.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/indexing.md\\" (of type \\"TypeB\\") is missing the following required fields:
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
     │   • docs/killer_handcrafted_synthesize.md
     │   • docs/redundant_silver_card.md
     │   • docs/maryland_market.md
     │   • docs/content_steel_coordinator.md
     │   
     └── Couldn't find document type definitions provided by name for 2 documents. (Skipping documents)
         
         Please use one of the following document type names: TypeA, TypeB.
         
         • docs/rhenium_grocery.md (Used type name: \\"TypeB\\")
         • docs/northeast.md (Used type name: \\"TypeB\\")
         
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
     │   • docs/killer_handcrafted_synthesize.md
     │   • docs/redundant_silver_card.md
     │   • docs/maryland_market.md
     │   • docs/content_steel_coordinator.md
     │   
     ├── Couldn't find document type definitions provided by name for 2 documents. (Skipping documents)
     │   
     │   Please use one of the following document type names: TypeA, TypeB.
     │   
     │   • docs/rhenium_grocery.md (Used type name: \\"TypeB\\")
     │   • docs/northeast.md (Used type name: \\"TypeB\\")
     │   
     └──   1 documents contain field data which isn't defined in the document type definition.
         
         • \\"docs/system_paradigm_hatchback.md\\" of type \\"TypeB\\" has the following extra fields:
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
     │   • docs/killer_handcrafted_synthesize.md
     │   • docs/redundant_silver_card.md
     │   • docs/maryland_market.md
     │   • docs/content_steel_coordinator.md
     │   
     ├── Couldn't find document type definitions provided by name for 2 documents. (Skipping documents)
     │   
     │   Please use one of the following document type names: TypeA, TypeB.
     │   
     │   • docs/rhenium_grocery.md (Used type name: \\"TypeB\\")
     │   • docs/northeast.md (Used type name: \\"TypeB\\")
     │   
     ├── Encountered unexpected errors while processing of 2 documents. This is possibly a bug in Contentlayer. Please open an issue.
     │   
     │   • \\"docs/system_paradigm_hatchback.md\\": Error: Some problem happened: The SSD monitor is down, calculate the cross-platform system so we can navigate the SAS card!
     │   • \\"docs/gorgeous_rich.md\\": Error: Some problem happened: The SSL system is down, override the 1080p driver so we can connect the API system!
     │   
     ├── Error during computed field exection for 1 documents. (Skipping documents)
     │   
     │   • \\"docs/bulgarian.md\\" failed with Error: Some problem happened: I'll generate the solid state IP feed, that should capacitor the SSD firewall!
     │   
     └── Missing required fields for 3 documents. (Skipping documents)
         
         • \\"docs/intranet_northwest.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/redundant.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/useful_bronze_online.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         
    "
  `)
})
