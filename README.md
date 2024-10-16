# LinqQL

LinqQL is a lightweight declarative GraphQL query builder with static typing.

## Installation

```bash
npm install linqql
```

## Basic Usage

LinqQL requires schema types in order to statically type queries. You can manually create these but we recommend something like `@graphql-codegen/typescript` to automatically generate your types.

```typescript
import { build } from "linqql";
import type { User, QueryUserArgs } from "./types";

const query = build<User, QueryUserArgs>("getUser")
  .id("my-id")
  .select(["id", "name"])
  .query();

console.log(query.toString());
/* Output:
query {
  getUser {
    id
    name
  }
}
*/
```

## Core Concepts

LinqQL operates on a few key types and patterns:

### Build Arguments

When constructing queries, LinqQL handles different argument types through the `BuildArg` type. It can handle complex objects, arrays, or primitive types.

### Field Selection

LinqQL supports selecting fields in an intuitive way using the `select` method. You can either pass an object of fields or an array:

```typescript
query.select(["id", "name"]);
query.select({ id: true, name: true });
```

You can also easily select child fields with simple object notation:

```ts
query.select({
  id: true,
  settings: ["contactPreferences"],
  transactions: {
    id: true,
    amount: true,
  },
});
```

And you can nest queries to create more complex filters and interactions

```ts
query.select({
  transactions: build<Transaction[], QueryUserTransactionsArgs>("transactions")
    .where({
      amount_gt: 100,
    })
    .select(["id", "amount"]),
});
```

### Query and Mutation Types

Queries and mutations can be constructed by chaining `.query()` or `.mutation()` methods:

```typescript
query.query(); // Marks it as a query
query.mutation(); // Marks it as a mutation
```

### Stringification

LinqQL generates the GraphQL string behind the scenes, formatting your queries as needed:

```typescript
query.toString(); // Outputs the string form of the query
```

### Return type

The return type is also calculated and can be extracted from the query. This determines which fields have been selected from the query.

```ts
import { ResponseType } from "linqql";

type Result = ResponseType<typeof query>;
```

## Advanced Usage

### Combining Queries

LinqQL also supports combining queries, allowing you to compose more complex GraphQL requests:

```typescript
import { combine } from "linqql";

const queryA = build<User>("getUser").select({ id: true }).query();
const queryB = build<Post[]>("getPosts").select({ title: true }).query();

const combinedQuery = combine({
  getUser: queryA,
  getPosts: queryB,
});

console.log(combinedQuery.toString());
// Output: query { getUser { id } getPosts { title } }
```

### Handling Enums

GraphQL has a specific way of handling enums that needs to be treated as a special case. Therefore if you are passing an enum into an argument, you need to call the `.enum` adapter:

```typescript
query.status.enum(UserStatus.ACTIVE);
```
