import type * as core from '@contentlayer/core'

import { FetchDataAggregateError } from '../../errors/aggregate'
import type { Flags } from '../../types'
import { makeErrors, makeSchemaDef } from './utils'

const typeFieldName = 'type'
const bodyFieldName = 'body'
const options: core.PluginOptions = {
  markdown: undefined,
  mdx: undefined,
  fieldOptions: { typeFieldName, bodyFieldName },
}
const flags: Flags = {
  onExtraFieldData: 'warn',
  onMissingOrIncompatibleData: 'skip-ignore',
  onUnknownDocuments: 'fail',
}
const schemaDef = makeSchemaDef()

describe('CouldNotDetermineDocumentTypeError', () => {
  it('4 errors', () => {
    const aggregateError = new FetchDataAggregateError({
      errors: makeErrors({ CouldNotDetermineDocumentTypeError: 4 }),
      options,
      flags,
      schemaDef,
      documentCount: 42,
    })

    expect(aggregateError.toString()).toMatchInlineSnapshot(`
"Error: Found problems in 4 of 42 documents.

 └── Couldn't determine the document type for 4 documents.
     
     Please either define a filePathPattern for the given document type definition or provide a valid value for the type field (i.e. the field \\"type\\" needs to be one of the following document type names: TypeA, TypeB).
     
     • docs/port_quality_focused_monitor.md
     • docs/mobile_metical.md
     • docs/synergize.md
     • docs/card_balanced.md
     
"
`)
  })

  it('24 errors - truncated', () => {
    const aggregateError = new FetchDataAggregateError({
      errors: makeErrors({ CouldNotDetermineDocumentTypeError: 24 }),
      options,
      flags,
      schemaDef,
      documentCount: 81,
    })

    expect(aggregateError.toString()).toMatchInlineSnapshot(`
"Error: Found problems in 24 of 81 documents.

 └── Couldn't determine the document type for 24 documents.
     
     Please either define a filePathPattern for the given document type definition or provide a valid value for the type field (i.e. the field \\"type\\" needs to be one of the following document type names: TypeA, TypeB).
     
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
     
"
`)
  })
})

it('24 errors - full', () => {
  const aggregateError = new FetchDataAggregateError({
    errors: makeErrors({ CouldNotDetermineDocumentTypeError: 24 }),
    options,
    flags,
    schemaDef,
    documentCount: 81,
    verbose: true,
  })

  expect(aggregateError.toString()).toMatchInlineSnapshot(`
"Error: Found problems in 24 of 81 documents.

 └── Couldn't determine the document type for 24 documents.
     
     Please either define a filePathPattern for the given document type definition or provide a valid value for the type field (i.e. the field \\"type\\" needs to be one of the following document type names: TypeA, TypeB).
     
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
     
"
`)
})

describe('mix of different errors', () => {
  it('some', () => {
    const aggregateError = new FetchDataAggregateError({
      errors: makeErrors({ CouldNotDetermineDocumentTypeError: 4, NoSuchDocumentTypeError: 2 }),
      options,
      flags,
      schemaDef,
      documentCount: 42,
    })

    expect(aggregateError.toString()).toMatchInlineSnapshot(`
"Error: Found problems in 6 of 42 documents.

 ├── Couldn't determine the document type for 4 documents.
 │   
 │   Please either define a filePathPattern for the given document type definition or provide a valid value for the type field (i.e. the field \\"type\\" needs to be one of the following document type names: TypeA, TypeB).
 │   
 │   • docs/port_quality_focused_monitor.md
 │   • docs/mobile_metical.md
 │   • docs/synergize.md
 │   • docs/card_balanced.md
 │   
 └── Couldn't find document type definitions provided by name for 2 documents.
     
     Please use one of the following document type names: TypeA, TypeB.
     
     • docs/card_table.md (Used type name: \\"Bandwidth\\")
     • docs/firewall_withdrawal.md (Used type name: \\"Sensor\\")
     
"
`)
  })

  it('other', () => {
    const aggregateError = new FetchDataAggregateError({
      errors: makeErrors({
        CouldNotDetermineDocumentTypeError: 4,
        NoSuchDocumentTypeError: 2,
        ComputedValueError: 1,
        InvalidDataDuringMappingError: 2,
      }),
      options,
      flags,
      schemaDef,
      documentCount: 42,
    })

    expect(aggregateError.toString()).toMatchInlineSnapshot(`
"Error: Found problems in 9 of 42 documents.

 ├── Couldn't determine the document type for 4 documents.
 │   
 │   Please either define a filePathPattern for the given document type definition or provide a valid value for the type field (i.e. the field \\"type\\" needs to be one of the following document type names: TypeA, TypeB).
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
 │   • docs/card_table.md (Used type name: \\"Bandwidth\\")
 │   • docs/firewall_withdrawal.md (Used type name: \\"Sensor\\")
 │   
 ├── ComputedValueError: Some problem happened: We need to calculate the virtual SSL matrix!
 │   ComputedValueError: Some problem happened: If we reboot the application, we can get to the FTP circuit through the redundant SCSI feed!
 │   
 └── ComputedValueError: Error: Some problem happened: Use the online XML hard drive, then you can copy the bluetooth bandwidth!
     
"
`)
  })
})
