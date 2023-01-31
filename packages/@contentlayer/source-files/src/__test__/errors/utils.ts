import * as path from 'node:path'

import type * as core from '@contentlayer/core'
import type { RelativePosixFilePath } from '@contentlayer/utils'
import { singleItem, unknownToRelativePosixFilePath } from '@contentlayer/utils'
import { faker } from '@faker-js/faker'

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

export const makeSchemaWithSingletonDef = (): core.SchemaDef => {
  const TypeA: core.DocumentTypeDef = {
    _tag: 'DocumentTypeDef',
    name: 'TypeA',
    description: undefined,
    fieldDefs: [],
    computedFields: [],
    extensions: {},
    isSingleton: true,
  }
  const TypeB: core.DocumentTypeDef = {
    _tag: 'DocumentTypeDef',
    name: 'TypeB',
    description: undefined,
    fieldDefs: [],
    computedFields: [],
    extensions: {},
    isSingleton: true,
  }
  const schemaDef: core.SchemaDef = { hash: '', nestedTypeDefMap: {}, documentTypeDefMap: { TypeA, TypeB } }
  return schemaDef
}

const generateFakeFilePath = (extension = 'md'): RelativePosixFilePath =>
  singleItem(path.join('docs', faker.system.commonFileName(extension))).map(unknownToRelativePosixFilePath).item

export const makeErrors = (
  countRecord: Partial<Record<FetchDataError.FetchDataError['_tag'], number>>,
  schemaDef: core.SchemaDef,
): FetchDataError.FetchDataError[] => {
  const errors: FetchDataError.FetchDataError[] = []

  faker.seed(123)

  const documentTypeNames = Object.keys(schemaDef.documentTypeDefMap)
  const documentTypeName = faker.helpers.arrayElement(documentTypeNames)
  const documentTypeDef = schemaDef.documentTypeDefMap[documentTypeName]!

  doNTimes(countRecord.CouldNotDetermineDocumentTypeError, () => {
    const documentFilePath = generateFakeFilePath()
    errors.push(new FetchDataError.CouldNotDetermineDocumentTypeError({ typeFieldName: 'type', documentFilePath }))
  })

  doNTimes(countRecord.NoSuchDocumentTypeError, () => {
    const documentFilePath = generateFakeFilePath()
    errors.push(new FetchDataError.NoSuchDocumentTypeError({ documentFilePath, documentTypeName }))
  })

  doNTimes(countRecord.UnexpectedError, () => {
    const documentFilePath = generateFakeFilePath()
    errors.push(
      new FetchDataError.UnexpectedError({
        documentFilePath,
        error: new Error(`Some problem happened: ${faker.hacker.phrase()}`),
      }),
    )
  })

  doNTimes(countRecord.ComputedValueError, () => {
    const documentFilePath = generateFakeFilePath()
    const error = new Error(`Some problem happened: ${faker.hacker.phrase()}`)
    errors.push(
      new FetchDataError.ComputedValueError({
        documentFilePath,
        error,
        documentTypeDef,
      }),
    )
  })

  doNTimes(countRecord.ExtraFieldDataError, (index) => {
    const documentFilePath = generateFakeFilePath()
    errors.push(
      new FetchDataError.ExtraFieldDataError({
        documentFilePath,
        documentTypeDef,
        extraFieldEntries: [index === 0 ? ['someKey', 'someVal'] : ['someOtherKey', 42]],
      }),
    )
  })

  doNTimes(countRecord.MissingRequiredFieldsError, () => {
    const documentFilePath = generateFakeFilePath()
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
        documentTypeDef,
        fieldDefsWithMissingData: [fieldDef],
      }),
    )
  })

  return errors
}

const doNTimes = (n_: number | undefined, fn: (i: number) => void): void => {
  const n = n_ ?? 0
  for (let i = 0; i < n; i++) {
    fn(i)
  }
}
