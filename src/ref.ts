export interface Ref<T = unknown> {
  current: T;
}

export function createRef<T = unknown>(initialValue: T): Ref<T> {
  return {
    current: initialValue,
  };
}
