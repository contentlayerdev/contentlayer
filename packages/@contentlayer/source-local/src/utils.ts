export function unwrapThunk<T>(_: T | (() => T)): T {
  if (typeof _ === 'function') {
    return (_ as any)()
  } else {
    return _
  }
}
