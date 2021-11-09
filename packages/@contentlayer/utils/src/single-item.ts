export class SingleItem<T> {
  constructor(public item: T) {}

  map<U>(fn: (item: T) => U): SingleItem<U> {
    return new SingleItem(fn(this.item))
  }

  filter(fn: (item: T) => boolean): SingleItem<T | undefined> {
    return fn(this.item) ? this : new SingleItem(undefined)
  }
}

export const singleItem = <T>(item: T) => new SingleItem(item)
