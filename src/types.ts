export type Query = {
  __R: any;
  select: (fields: any) => Query;
  query: () => Query;
  mutation: () => Query;
  toString: () => string;
};

type BuildArgComplex<T, A, R> = (args: T) => BuildArgs<A, R>;
type BuildArgArray = unknown;
type BuildArgPrimitive<T, A, R> = ((value: T) => BuildArgs<A, R>) & {
  enum: (value: T) => BuildArgs<A, R>;
};

// Define BuildArg to handle different cases (objects, arrays, primitives)
type BuildArg<T, A, R> = [T] extends [Record<string, unknown>]
  ? BuildArgComplex<T, A, R>
  : [T] extends [Array<unknown>]
  ? BuildArgArray
  : [T] extends [null | undefined]
  ? BuildArgPrimitive<null, A, R>
  : BuildArgPrimitive<T, A, R>;

// BuildArgs2 type to handle the core logic of building args
type BuildArgs2<A, R> = {
  [K in keyof A]: BuildArg<A[K], A, R>;
};

// BuildArgs type ensuring only selected fields are included
type BuildArgs<A, R, _R = R> = BuildArgs2<Required<A>, R> & {
  select: R extends Array<infer U>
    ? BuildSelectFn<A, U, R>
    : BuildSelectFn<A, R, R>;
  query: () => BuildArgs<A, R, _R>;
  mutation: () => BuildArgs<A, R, _R>;
  __R: _R;
};

interface BuildSelectFn<A, U, R> {
  <F extends BuildSelect<A, U>>(fields: F): BuildArgs<
    A,
    R,
    R extends Array<unknown>
      ? ExtractSelectedFields<U, F>[]
      : ExtractSelectedFields<U, F>
  >;

  <F extends Array<R extends Array<infer U> ? keyof U : keyof R>>(
    fields: F
  ): BuildArgs<
    U,
    R,
    R extends Array<unknown>
      ? ExtractSelectedFields<U, F>[]
      : ExtractSelectedFields<U, F>
  >;
}

type ExtractDirectSelection<T, S, K extends keyof S> = K extends keyof T
  ? S[K] extends true
    ? T[K]
    : never
  : never;

type ExtractAliasSelection<T, S, K extends keyof S> = K extends keyof T
  ? S[K] extends keyof T
    ? T[S[K]]
    : never
  : S[K] extends keyof T
  ? T[S[K]]
  : never;

type ExtractNestedSelection<T, S, K extends keyof S> = K extends keyof T
  ? S[K] extends Record<string, unknown>
    ? ExtractSelectedFields<T[K], S[K]>
    : never
  : never;

type ExtractQuerySelection<T> = T extends Query ? T["__R"] : never;

type ExtractObjectSelection<T, S> = {
  [K in keyof S]:
    | ExtractDirectSelection<T, S, K>
    | ExtractAliasSelection<T, S, K>
    | ExtractQuerySelection<S[K]>
    | ExtractNestedSelection<T, S, K>;
};

type ExtractArraySelection<T, S extends Array<keyof T>> = {
  [K in S[number]]: T[K];
};

type ExtractSelectedFields<T, S> = S extends Array<keyof T>
  ? ExtractArraySelection<T, S>
  : ExtractObjectSelection<T, S>;

// BuildSelect type to handle `true` selections and nested objects
type BuildSelect<A, R> =
  | {
      [K in keyof R]?: string | true | BuildSelect<A, R[K]> | Query;
    }
  | Record<string, keyof R>;

// Core Build function to initiate the query building process
export type Build = <R, A = Record<string, never>>(
  name: string
) => BuildArgs<A, R>;

export type Combine = <T extends Record<string, Query>>(
  t: T
) => {
  __R: {
    [K in keyof T]: T[K]["__R"];
  };
  select: (fields: any) => Query;
  query: () => Query;
  mutation: () => Query;
};

export type ResponseType<T extends Query> = T["__R"];
