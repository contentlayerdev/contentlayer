import type * as core from '@contentlayer/core'
import { capitalizeFirstLetter } from '@contentlayer/utils'
import faker from 'faker'
import * as path from 'path'

import type { FetchDataError } from '../../errors'
import {
  ComputedValueError,
  CouldNotDetermineDocumentTypeError,
  InvalidDataDuringMappingError,
  NoSuchDocumentTypeError,
} from '../../errors'

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

export const makeErrors = (countRecord: Partial<Record<FetchDataError['_tag'], number>>): FetchDataError[] => {
  const errors: FetchDataError[] = []

  faker.seed(123)

  doNTimes(countRecord.CouldNotDetermineDocumentTypeError, () => {
    const documentFilePath = path.join('docs', faker.system.commonFileName('md'))
    errors.push(new CouldNotDetermineDocumentTypeError({ typeFieldName: 'type', documentFilePath }))
  })

  doNTimes(countRecord.NoSuchDocumentTypeError, () => {
    const documentFilePath = path.join('docs', faker.system.commonFileName('md'))
    const documentTypeName = capitalizeFirstLetter(faker.hacker.noun())
    errors.push(new NoSuchDocumentTypeError({ documentFilePath, documentTypeName }))
  })

  doNTimes(countRecord.InvalidDataDuringMappingError, () => {
    const documentFilePath = path.join('docs', faker.system.commonFileName('md'))
    errors.push(
      new InvalidDataDuringMappingError({
        documentFilePath,
        message: `Some problem happened: ${faker.hacker.phrase()}`,
      }),
    )
  })

  doNTimes(countRecord.ComputedValueError, () => {
    errors.push(new ComputedValueError({ error: new Error(`Some problem happened: ${faker.hacker.phrase()}`) }))
  })

  return errors
}

const doNTimes = (n_: number | undefined, fn: () => void): void => {
  const n = n_ ?? 0
  for (let i = 0; i < n; i++) {
    fn()
  }
}
