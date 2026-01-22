# antithrow

A TypeScript library implementing Rust-style `Result<T, E>` types for type-safe error handling without exceptions.

## Installation

```bash
bun add antithrow
```

## Usage

### Basic Results

```ts
import { ok, err, Result } from "antithrow";

function divide(a: number, b: number): Result<number, string> {
  if (b === 0) return err("division by zero");
  return ok(a / b);
}

const result = divide(10, 2);

if (result.isOk()) {
  console.log(result.value); // 5
}

// Or use pattern matching
result.match({
  ok: (value) => console.log(`Result: ${value}`),
  err: (error) => console.error(`Error: ${error}`),
});
```

### Wrapping Throwing Functions

```ts
import { Result } from "antithrow";

const parsed = Result.try(() => JSON.parse('{"a": 1}'));
// ok({ a: 1 })

const failed = Result.try(() => JSON.parse("invalid"));
// err(SyntaxError)
```

### Chaining Operations

```ts
import { ok, err } from "antithrow";

const result = ok(2)
  .map((x) => x * 2)           // ok(4)
  .andThen((x) => ok(x + 1))   // ok(5)
  .mapErr((e) => e.toUpperCase());
```

### Generator-Based Chaining

Use generators for early-return semantics similar to Rust's `?` operator:

```ts
import { chain, ok, err } from "antithrow";

const result = chain(function* () {
  const a = yield* ok(1);
  const b = yield* ok(2);
  const c = yield* err("oops"); // Short-circuits here
  return a + b + c; // Never reached
});
// err("oops")
```

### Async Results

```ts
import { okAsync, errAsync, ResultAsync } from "antithrow";

const result = await okAsync(42)
  .map((x) => x * 2)
  .andThen((x) => okAsync(x + 1))
  .unwrap();
// 85

// Wrap async functions that might throw
const fetched = ResultAsync.try(async () => {
  const response = await fetch("/api/data");
  return response.json();
});
```

### Async Generator Chaining

```ts
import { chain, okAsync, errAsync } from "antithrow";

const result = await chain(async function* () {
  const a = yield* okAsync(1);
  const b = yield* okAsync(2);
  return a + b;
});
// ok(3)
```

## API

### Constructors

| Function | Description |
|----------|-------------|
| `ok(value)` | Creates a successful result |
| `err(error)` | Creates a failed result |
| `okAsync(value)` | Creates an async successful result |
| `errAsync(error)` | Creates an async failed result |
| `Result.try(fn)` | Wraps a throwing function in a Result |
| `ResultAsync.try(fn)` | Wraps an async throwing function in a ResultAsync |
| `chain(generator)` | Chains results using generator syntax |

### Methods

Both `Result` and `ResultAsync` support:

| Method | Description |
|--------|-------------|
| `isOk()` | Type predicate for success |
| `isErr()` | Type predicate for failure |
| `unwrap()` | Returns value or throws |
| `unwrapErr()` | Returns error or throws |
| `unwrapOr(default)` | Returns value or default |
| `unwrapOrElse(fn)` | Returns value or computes from error |
| `map(fn)` | Transforms the success value |
| `mapErr(fn)` | Transforms the error value |
| `mapOr(default, fn)` | Transforms or returns default |
| `mapOrElse(defaultFn, fn)` | Transforms or computes default |
| `andThen(fn)` | Chains with another Result-returning function |
| `orElse(fn)` | Recovers from error with another Result |
| `match({ ok, err })` | Pattern matches on the result |
| `inspect(fn)` | Side effects on success value |
| `inspectErr(fn)` | Side effects on error value |
