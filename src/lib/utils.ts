const RE_REGULAR = /^[\t|\r|\n|\x20-\x7E]*$/;

export const isRegularString = (x: string): boolean => RE_REGULAR.test(x);

export const isInteger = (x: number): boolean => Math.floor(x) === x;

export const sleep = (ms = 0): Promise<void> => new Promise((resolve) => {
  const t = setTimeout(() => {
    clearTimeout(t);
    resolve();
  }, ms);
});

export type VuePropsType<T extends new (...args: any) => unknown> =
  T extends new (...args: any) => infer R ? (
    R extends { $props: Record<string, unknown> } ? R['$props'] : never
  ) : never;

// `props` type & optional `key`
export type VueBindingsType<T extends new (...args: any) => unknown> =
  VuePropsType<T> extends Record<string, unknown>
  ? VuePropsType<T> & { key?: string }
  : never;

// `props` type & required `key`
export type VueBindingsWithKeyType<T extends new (...args: any) => unknown> =
  VueBindingsType<T> extends Record<string, unknown>
  ? VueBindingsType<T> & { key: string }
  : never;
