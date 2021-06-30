import type { OperatorFunction } from 'rxjs'
import { of } from 'rxjs'
import { concatMap } from 'rxjs/operators'

export const tapSkipFirst = <T>(tapFn: (t: T) => void): OperatorFunction<T, T> => {
  return (source$) =>
    source$.pipe(
      concatMap((value, index) => {
        if (index !== 0) {
          tapFn(value)
        }
        return of(value)
      }),
    )
}
