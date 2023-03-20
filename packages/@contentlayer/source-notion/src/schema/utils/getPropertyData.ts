import type {
  DatabaseProperty,
  DatabasePropertyData,
  DatabasePropertyTypes,
  PageProperty,
  PagePropertyData,
  PagePropertyTypes,
} from '../../types'

export const getPagePropertyData = <T extends PagePropertyTypes>(property: PageProperty<T>): PagePropertyData<T> => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return property[property.type]
}

export const getDatabasePropertyData = <T extends DatabasePropertyTypes>(
  property: DatabaseProperty<T>,
): DatabasePropertyData<T> => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return property[property.type]
}
