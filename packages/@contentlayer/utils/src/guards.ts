export const isNotUndefined = <T>(_: T | undefined): _ is T => _ !== undefined
export const isUndefined = <T>(_: T | undefined): _ is undefined => _ === undefined
