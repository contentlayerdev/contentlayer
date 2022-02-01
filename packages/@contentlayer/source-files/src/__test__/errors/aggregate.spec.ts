import type * as core from '@contentlayer/core'
import { posixFilePath } from '@contentlayer/utils'
import test from 'ava'

import { testOnly_aggregateFetchDataErrors as aggregateFetchDataErrors } from '../../errors/aggregate.js'
import type { Flags } from '../../types.js'
import { makeErrors, makeSchemaDef } from './utils.js'

const typeFieldName = 'type'
const bodyFieldName = 'body'
const options: core.PluginOptions = {
  markdown: undefined,
  mdx: undefined,
  date: undefined,
  fieldOptions: { typeFieldName, bodyFieldName },
}
const flags: Flags = {
  onExtraFieldData: 'warn',
  onMissingOrIncompatibleData: 'skip-warn',
  onUnknownDocuments: 'skip-warn',
}
const schemaDef = makeSchemaDef()
const contentDirPath = posixFilePath('./content')

test('CouldNotDetermineDocumentTypeError: should print 4 errors', async (t) => {
  const errorString = aggregateFetchDataErrors({
    errors: makeErrors({ CouldNotDetermineDocumentTypeError: 4 }),
    options,
    flags,
    schemaDef,
    contentDirPath,
    documentCount: 42,
  })

  t.is(
    errorString,
    `\
Warning: Found 4 problems in 42 documents. Skipping those documents.

 └── Couldn't determine the document type for 4 documents.
     
     Please either define a filePathPattern for the given document type definition or provide a valid value for the type field (i.e. the field "type" needs to be one of the following document type names: TypeA, TypeB).
     
     • docs/port_quality_focused_monitor.md
     • docs/mobile_metical.md
     • docs/synergize.md
     • docs/card_balanced.md
     
`,
  )
})

test('CouldNotDetermineDocumentTypeError: should print 24 errors - truncated', async (t) => {
  const errorString = aggregateFetchDataErrors({
    errors: makeErrors({ CouldNotDetermineDocumentTypeError: 24 }),
    options,
    flags,
    schemaDef,
    contentDirPath,
    documentCount: 81,
  })

  t.is(
    errorString,
    `\
Warning: Found 24 problems in 81 documents. Skipping those documents.

 └── Couldn't determine the document type for 24 documents.
     
     Please either define a filePathPattern for the given document type definition or provide a valid value for the type field (i.e. the field "type" needs to be one of the following document type names: TypeA, TypeB).
     
     • docs/port_quality_focused_monitor.md
     • docs/mobile_metical.md
     • docs/synergize.md
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
     • ... 4 more documents (Use the --verbose CLI option to show all documents)
     
`,
  )
})

test('CouldNotDetermineDocumentTypeError: should print 24 errors - full', async (t) => {
  const errorString = aggregateFetchDataErrors({
    errors: makeErrors({ CouldNotDetermineDocumentTypeError: 24 }),
    options,
    flags,
    schemaDef,
    contentDirPath,
    documentCount: 81,
    verbose: true,
  })

  t.is(
    errorString,
    `\
Warning: Found 24 problems in 81 documents. Skipping those documents.

 └── Couldn't determine the document type for 24 documents.
     
     Please either define a filePathPattern for the given document type definition or provide a valid value for the type field (i.e. the field "type" needs to be one of the following document type names: TypeA, TypeB).
     
     • docs/port_quality_focused_monitor.md
     • docs/mobile_metical.md
     • docs/synergize.md
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
     
`,
  )
})

test('CouldNotDetermineDocumentTypeError: should ignore the errors', async (t) => {
  const errorString = aggregateFetchDataErrors({
    errors: makeErrors({ CouldNotDetermineDocumentTypeError: 24 }),
    options,
    flags: { ...flags, onUnknownDocuments: 'skip-ignore' },
    schemaDef,
    contentDirPath,
    documentCount: 81,
    verbose: true,
  })

  t.is(errorString, null)
})

test('MissingRequiredFieldsError: should print 4 errors', async (t) => {
  const errorString = aggregateFetchDataErrors({
    errors: makeErrors({ MissingRequiredFieldsError: 4 }),
    options,
    flags,
    schemaDef,
    contentDirPath,
    documentCount: 42,
  })

  t.is(
    errorString,
    `\
Warning: Found 4 problems in 42 documents. Skipping those documents.

 └── Missing required fields for 4 documents
     
     • "docs/port_quality_focused_monitor.md" is missing the following required fields:
       • someField: string
     • "docs/administrator_missouri_synergize.md" is missing the following required fields:
       • someField: string
     • "docs/help_desk_soap_deposit.md" is missing the following required fields:
       • someField: string
     • "docs/poland.md" is missing the following required fields:
       • someField: string
     
`,
  )
})

test('MissingRequiredFieldsError: should print 24 errors - truncated', async (t) => {
  const errorString = aggregateFetchDataErrors({
    errors: makeErrors({ MissingRequiredFieldsError: 24 }),
    options,
    flags,
    schemaDef,
    contentDirPath,
    documentCount: 81,
  })

  t.is(
    errorString,
    `\
Warning: Found 24 problems in 81 documents. Skipping those documents.

 └── Missing required fields for 24 documents
     
     • "docs/port_quality_focused_monitor.md" is missing the following required fields:
       • someField: string
     • "docs/administrator_missouri_synergize.md" is missing the following required fields:
       • someField: string
     • "docs/help_desk_soap_deposit.md" is missing the following required fields:
       • someField: string
     • "docs/poland.md" is missing the following required fields:
       • someField: string
     • "docs/solution_monitor.md" is missing the following required fields:
       • someField: string
     • "docs/e_services_dynamic_focused.md" is missing the following required fields:
       • someField: string
     • "docs/licensed_grocery_avon.md" is missing the following required fields:
       • someField: string
     • "docs/district.md" is missing the following required fields:
       • someField: string
     • "docs/optimization_plaza_plastic.md" is missing the following required fields:
       • someField: string
     • "docs/vatu_configurable.md" is missing the following required fields:
       • someField: string
     • "docs/open_architected_auto_stream.md" is missing the following required fields:
       • someField: string
     • "docs/italy.md" is missing the following required fields:
       • someField: string
     • "docs/killer.md" is missing the following required fields:
       • someField: string
     • "docs/agp_radial_tennessee.md" is missing the following required fields:
       • someField: string
     • "docs/sudan_incredible_future.md" is missing the following required fields:
       • someField: string
     • "docs/hawaii_timor_leste.md" is missing the following required fields:
       • someField: string
     • "docs/matrix_pike_montana.md" is missing the following required fields:
       • someField: string
     • "docs/synthesize.md" is missing the following required fields:
       • someField: string
     • "docs/of_maroon.md" is missing the following required fields:
       • someField: string
     • "docs/calculating_integrate_function.md" is missing the following required fields:
       • someField: string
     • ... 4 more documents (Use the --verbose CLI option to show all documents)
     
`,
  )
})

test('mix of different errors: some', async (t) => {
  const errorString = aggregateFetchDataErrors({
    errors: makeErrors({ CouldNotDetermineDocumentTypeError: 4, NoSuchDocumentTypeError: 2 }),
    options,
    flags,
    schemaDef,
    contentDirPath,
    documentCount: 42,
  })

  t.is(
    errorString,
    `\
Warning: Found 6 problems in 42 documents. Skipping those documents.

 ├── Couldn't determine the document type for 4 documents.
 │   
 │   Please either define a filePathPattern for the given document type definition or provide a valid value for the type field (i.e. the field "type" needs to be one of the following document type names: TypeA, TypeB).
 │   
 │   • docs/port_quality_focused_monitor.md
 │   • docs/mobile_metical.md
 │   • docs/synergize.md
 │   • docs/card_balanced.md
 │   
 └── Couldn't find document type definitions provided by name for 2 documents.
     
     Please use one of the following document type names: TypeA, TypeB.
     
     • docs/card_table.md (Used type name: "Bandwidth")
     • docs/firewall_withdrawal.md (Used type name: "Sensor")
     
`,
  )
})

test('mix of different errors: other', async (t) => {
  const errorString = aggregateFetchDataErrors({
    errors: makeErrors({
      CouldNotDetermineDocumentTypeError: 4,
      NoSuchDocumentTypeError: 2,
      ComputedValueError: 1,
      UnexpectedError: 2,
      MissingRequiredFieldsError: 3,
    }),
    options,
    flags,
    schemaDef,
    contentDirPath,
    documentCount: 42,
  })

  t.is(
    errorString,
    `\
Error: Found 12 problems in 42 documents.

 ├── Couldn't determine the document type for 4 documents.
 │   
 │   Please either define a filePathPattern for the given document type definition or provide a valid value for the type field (i.e. the field "type" needs to be one of the following document type names: TypeA, TypeB).
 │   
 │   • docs/port_quality_focused_monitor.md
 │   • docs/mobile_metical.md
 │   • docs/synergize.md
 │   • docs/card_balanced.md
 │   
 ├── Couldn't find document type definitions provided by name for 2 documents.
 │   
 │   Please use one of the following document type names: TypeA, TypeB.
 │   
 │   • docs/card_table.md (Used type name: "Bandwidth")
 │   • docs/firewall_withdrawal.md (Used type name: "Sensor")
 │   
 ├── Encountered unexpected errors while processing of 2 documents. This is possibly a bug in Contentlayer. Please open an issue.
 │   
 │   • "docs/pixel_system_withdrawal.md": Error: Some problem happened: We need to calculate the virtual SSL matrix!
 │   • "docs/licensed_grocery_avon.md": Error: Some problem happened: If we reboot the application, we can get to the FTP circuit through the redundant SCSI feed!
 │   
 ├── Error during computed field exection for 1 documents.
 │   
 │   • "docs/berkshire_colorado.md" failed with Error: Some problem happened: Try to reboot the XML feed, maybe it will compress the redundant bus!
 │   
 └── Missing required fields for 3 documents
     
     • "docs/berkshire.md" is missing the following required fields:
       • someField: string
     • "docs/e_commerce_granite.md" is missing the following required fields:
       • someField: string
     • "docs/intermediate_clicks_and_mortar.md" is missing the following required fields:
       • someField: string
     
`,
  )
})
