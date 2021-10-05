import type * as core from '@contentlayer/core'
import { capitalizeFirstLetter } from '@contentlayer/utils'
import faker from 'faker'
import * as path from 'path'

import { FetchDataError } from '../../errors/index.js'

export const makeSchemaDef = (): core.SchemaDef => {
  const TypeA: core.DocumentTypeDef = {
    _tag: 'DocumentTypeDef',
    name: 'TypeA',
    description: undefined,
    fieldDefs: [],
    computedFields: [],
    extensions: {},
    isSingleton: false,
  }
  const TypeB: core.DocumentTypeDef = {
    _tag: 'DocumentTypeDef',
    name: 'TypeB',
    description: undefined,
    fieldDefs: [],
    computedFields: [],
    extensions: {},
    isSingleton: false,
  }
  const schemaDef: core.SchemaDef = { hash: '', nestedTypeDefMap: {}, documentTypeDefMap: { TypeA, TypeB } }
  return schemaDef
}

export const makeErrors = (
  countRecord: Partial<Record<FetchDataError.FetchDataError['_tag'], number>>,
): FetchDataError.FetchDataError[] => {
  const errors: FetchDataError.FetchDataError[] = []

  faker.seed(123)

  doNTimes(countRecord.CouldNotDetermineDocumentTypeError, () => {
    const documentFilePath = path.join('docs', faker.system.commonFileName('md'))
    errors.push(new FetchDataError.CouldNotDetermineDocumentTypeError({ typeFieldName: 'type', documentFilePath }))
  })

  doNTimes(countRecord.NoSuchDocumentTypeError, () => {
    const documentFilePath = path.join('docs', faker.system.commonFileName('md'))
    const documentTypeName = capitalizeFirstLetter(faker.hacker.noun())
    errors.push(new FetchDataError.NoSuchDocumentTypeError({ documentFilePath, documentTypeName }))
  })

  doNTimes(countRecord.UnexpectedError, () => {
    const documentFilePath = path.join('docs', faker.system.commonFileName('md'))
    errors.push(
      new FetchDataError.UnexpectedError({
        documentFilePath,
        error: new Error(`Some problem happened: ${faker.hacker.phrase()}`),
      }),
    )
  })

  doNTimes(countRecord.ComputedValueError, () => {
    const documentFilePath = path.join('docs', faker.system.commonFileName('md'))
    const error = new Error(`Some problem happened: ${faker.hacker.phrase()}`)
    errors.push(new FetchDataError.ComputedValueError({ documentFilePath, error }))
  })

  doNTimes(countRecord.ExtraFieldDataError, () => {
    const documentFilePath = path.join('docs', faker.system.commonFileName('md'))
    const documentTypeName = capitalizeFirstLetter(faker.hacker.noun())
    errors.push(
      new FetchDataError.ExtraFieldDataError({
        documentFilePath,
        documentTypeName,
        extraFieldEntries: [
          ['someKey', 'someVal'],
          ['someOtherKey', 42],
        ],
      }),
    )
  })

  doNTimes(countRecord.MissingRequiredFieldsError, () => {
    const documentFilePath = path.join('docs', faker.system.commonFileName('md'))
    const documentTypeName = capitalizeFirstLetter(faker.hacker.noun())
    const fieldDef: core.FieldDef = {
      type: 'string',
      name: 'someField',
      default: undefined,
      description: undefined,
      isRequired: true,
      isSystemField: false,
    }
    errors.push(
      new FetchDataError.MissingRequiredFieldsError({
        documentFilePath,
        documentTypeName,
        fieldDefsWithMissingData: [fieldDef],
      }),
    )
  })

  return errors
}

const doNTimes = (n_: number | undefined, fn: () => void): void => {
  const n = n_ ?? 0
  for (let i = 0; i < n; i++) {
    fn()
  }
}
