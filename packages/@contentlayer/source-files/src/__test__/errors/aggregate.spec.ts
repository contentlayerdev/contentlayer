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

  expect(errorString).toMatchInlineSnapshot(
    `
    "Warning: Found 4 problems in 42 documents.

     └── Couldn't determine the document type for 4 documents. (Skipping documents)
         
         Please either define a filePathPattern for the given document type definition or provide a valid value for the type field (i.e. the field \\"type\\" needs to be one of the following document type names: TypeA, TypeB).
         
         • docs/global_rupee_sensor.md
         • docs/administrator_missouri_synergize.md
         • docs/card_balanced.md
         • docs/card_table.md
         
    "
  `,
  )
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

  expect(errorString).toMatchInlineSnapshot(
    `
    "Warning: Found 24 problems in 81 documents.

     └── Couldn't determine the document type for 24 documents. (Skipping documents)
         
         Please either define a filePathPattern for the given document type definition or provide a valid value for the type field (i.e. the field \\"type\\" needs to be one of the following document type names: TypeA, TypeB).
         
         • docs/global_rupee_sensor.md
         • docs/administrator_missouri_synergize.md
         • docs/card_balanced.md
         • docs/card_table.md
         • docs/poland.md
         • docs/withdrawal_buckinghamshire.md
         • docs/synergistic_monitoring.md
         • docs/enterprise_wide_orchestrator.md
         • docs/index.md
         • docs/shoes_markets.md
         • docs/deliverables_palladium_berkshire.md
         • docs/plastic_berkshire.md
         • docs/future_berkshire_open_architected.md
         • docs/hack_synthesizing.md
         • docs/italy.md
         • docs/focus.md
         • docs/vatu_impactful_islands.md
         • docs/account_sudan_incredible.md
         • docs/digitized_borders_sleek.md
         • docs/account.md
         • ... 4 more documents (Use the --verbose CLI option to show all documents)
         
    "
  `,
  )
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

  expect(errorString).toMatchInlineSnapshot(
    `
    "Warning: Found 24 problems in 81 documents.

     └── Couldn't determine the document type for 24 documents. (Skipping documents)
         
         Please either define a filePathPattern for the given document type definition or provide a valid value for the type field (i.e. the field \\"type\\" needs to be one of the following document type names: TypeA, TypeB).
         
         • docs/global_rupee_sensor.md
         • docs/administrator_missouri_synergize.md
         • docs/card_balanced.md
         • docs/card_table.md
         • docs/poland.md
         • docs/withdrawal_buckinghamshire.md
         • docs/synergistic_monitoring.md
         • docs/enterprise_wide_orchestrator.md
         • docs/index.md
         • docs/shoes_markets.md
         • docs/deliverables_palladium_berkshire.md
         • docs/plastic_berkshire.md
         • docs/future_berkshire_open_architected.md
         • docs/hack_synthesizing.md
         • docs/italy.md
         • docs/focus.md
         • docs/vatu_impactful_islands.md
         • docs/account_sudan_incredible.md
         • docs/digitized_borders_sleek.md
         • docs/account.md
         • docs/health_user_ball.md
         • docs/boliviano_buckinghamshire_cuba.md
         • docs/internal_array.md
         • docs/front_line.md
         
    "
  `,
  )
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

  expect(errorString).toMatchInlineSnapshot(
    `
    "Warning: Found 4 problems in 42 documents.

     └── Missing required fields for 4 documents. (Skipping documents)
         
         • \\"docs/global_rupee_sensor.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/administrator_missouri_synergize.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/card_balanced.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/card_table.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         
    "
  `,
  )
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

  expect(errorString).toMatchInlineSnapshot(
    `
    "Error: Found 4 problems in 42 documents.

     └── Missing required fields for 4 documents.
         
         • \\"docs/global_rupee_sensor.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/administrator_missouri_synergize.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/card_balanced.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/card_table.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         
    "
  `,
  )
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

  expect(errorString).toMatchInlineSnapshot(
    `
    "Warning: Found 2 problems in 42 documents.

     └──   2 documents contain field data which isn't defined in the document type definition.
         
         • \\"docs/global_rupee_sensor.md\\" of type \\"TypeB\\" has the following extra fields:
           • someKey: \\"someVal\\" 
         • \\"docs/administrator_missouri_synergize.md\\" of type \\"TypeB\\" has the following extra fields:
           • someOtherKey: 42 
         
    "
  `,
  )
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

  expect(errorString).toMatchInlineSnapshot(
    `
    "Error: Found 2 problems in 42 documents.

     └──   2 documents contain field data which isn't defined in the document type definition.
         
         • \\"docs/global_rupee_sensor.md\\" of type \\"TypeB\\" has the following extra fields:
           • someKey: \\"someVal\\" 
         • \\"docs/administrator_missouri_synergize.md\\" of type \\"TypeB\\" has the following extra fields:
           • someOtherKey: 42 
         
    "
  `,
  )
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

  expect(errorString).toMatchInlineSnapshot(
    `
    "Warning: Found 24 problems in 81 documents.

     └── Missing required fields for 24 documents. (Skipping documents)
         
         • \\"docs/global_rupee_sensor.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/administrator_missouri_synergize.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/card_balanced.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/card_table.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/poland.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/withdrawal_buckinghamshire.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/synergistic_monitoring.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/enterprise_wide_orchestrator.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/index.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/shoes_markets.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/deliverables_palladium_berkshire.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/plastic_berkshire.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/future_berkshire_open_architected.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/hack_synthesizing.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/italy.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/focus.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/vatu_impactful_islands.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/account_sudan_incredible.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/digitized_borders_sleek.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/account.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • ... 4 more documents (Use the --verbose CLI option to show all documents)
         
    "
  `,
  )
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

  expect(errorString).toMatchInlineSnapshot(
    `
    "Warning: Found 6 problems in 42 documents.

     ├── Couldn't determine the document type for 4 documents. (Skipping documents)
     │   
     │   Please either define a filePathPattern for the given document type definition or provide a valid value for the type field (i.e. the field \\"type\\" needs to be one of the following document type names: TypeA, TypeB).
     │   
     │   • docs/global_rupee_sensor.md
     │   • docs/administrator_missouri_synergize.md
     │   • docs/card_balanced.md
     │   • docs/card_table.md
     │   
     └── Couldn't find document type definitions provided by name for 2 documents. (Skipping documents)
         
         Please use one of the following document type names: TypeA, TypeB.
         
         • docs/poland.md (Used type name: \\"TypeB\\")
         • docs/withdrawal_buckinghamshire.md (Used type name: \\"TypeB\\")
         
    "
  `,
  )
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

  expect(errorString).toMatchInlineSnapshot(
    `
    "Warning: Found 7 problems in 42 documents.

     ├── Couldn't determine the document type for 4 documents. (Skipping documents)
     │   
     │   Please either define a filePathPattern for the given document type definition or provide a valid value for the type field (i.e. the field \\"type\\" needs to be one of the following document type names: TypeA, TypeB).
     │   
     │   • docs/global_rupee_sensor.md
     │   • docs/administrator_missouri_synergize.md
     │   • docs/card_balanced.md
     │   • docs/card_table.md
     │   
     ├── Couldn't find document type definitions provided by name for 2 documents. (Skipping documents)
     │   
     │   Please use one of the following document type names: TypeA, TypeB.
     │   
     │   • docs/poland.md (Used type name: \\"TypeB\\")
     │   • docs/withdrawal_buckinghamshire.md (Used type name: \\"TypeB\\")
     │   
     └──   1 documents contain field data which isn't defined in the document type definition.
         
         • \\"docs/synergistic_monitoring.md\\" of type \\"TypeB\\" has the following extra fields:
           • someKey: \\"someVal\\" 
         
    "
  `,
  )
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

  expect(errorString).toMatchInlineSnapshot(
    `
    "Error: Found 12 problems in 42 documents.

     ├── Couldn't determine the document type for 4 documents. (Skipping documents)
     │   
     │   Please either define a filePathPattern for the given document type definition or provide a valid value for the type field (i.e. the field \\"type\\" needs to be one of the following document type names: TypeA, TypeB).
     │   
     │   • docs/global_rupee_sensor.md
     │   • docs/administrator_missouri_synergize.md
     │   • docs/card_balanced.md
     │   • docs/card_table.md
     │   
     ├── Couldn't find document type definitions provided by name for 2 documents. (Skipping documents)
     │   
     │   Please use one of the following document type names: TypeA, TypeB.
     │   
     │   • docs/poland.md (Used type name: \\"TypeB\\")
     │   • docs/withdrawal_buckinghamshire.md (Used type name: \\"TypeB\\")
     │   
     ├── Encountered unexpected errors while processing of 2 documents. This is possibly a bug in Contentlayer. Please open an issue.
     │   
     │   • \\"docs/synergistic_monitoring.md\\": Error: Some problem happened: Try to calculate the SSL card, maybe it will input the open-source matrix!
     │   • \\"docs/index.md\\": Error: Some problem happened: You can't copy the system without hacking the online CSS protocol!
     │   
     ├── Error during computed field exection for 1 documents. (Skipping documents)
     │   
     │   • \\"docs/deliverables_palladium_berkshire.md\\" failed with Error: Some problem happened: Use the virtual RAM sensor, then you can synthesize the virtual interface!
     │   
     └── Missing required fields for 3 documents. (Skipping documents)
         
         • \\"docs/future_berkshire_open_architected.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/hack_synthesizing.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         • \\"docs/italy.md\\" (of type \\"TypeB\\") is missing the following required fields:
           • someField: string
         
    "
  `,
  )
})
