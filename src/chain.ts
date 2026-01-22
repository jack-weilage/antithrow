import type { Err, Result } from "./result.js";
import { ok } from "./result.js";
import { ResultAsync } from "./result-async.js";

/**
 * Chains multiple Result operations using generator syntax for early return on errors.
 *
 * Use `yield*` with a `Result` to unwrap its value or short-circuit on error.
 *
 * @example
 * ```ts
 * const result = chain(function* () {
 *   const a = yield* ok(1);
 *   const b = yield* ok(2);
 *   return a + b;
 * });
 * ```
 *
 * @template T - The type of the success value.
 * @template E - The type of the error value.
 *
 * @param generator - A generator function that yields `Err` values and returns a success value.
 *
 * @returns A `Result` containing the final value or the first error encountered.
 */
export function chain<T, E>(generator: () => Generator<Err<never, E>, T, void>): Result<T, E>;
/**
 * Chains multiple ResultAsync operations using async generator syntax for early return on errors.
 *
 * Use `yield*` with a `ResultAsync` to unwrap its value or short-circuit on error.
 *
 * @example
 * ```ts
 * const result = chain(async function* () {
 *   const a = yield* okAsync(1);
 *   const b = yield* okAsync(2);
 *   return a + b;
 * });
 * ```
 *
 * @template T - The type of the success value.
 * @template E - The type of the error value.
 *
 * @param generator - An async generator function that yields `Err` values and returns a success value.
 *
 * @returns A `ResultAsync` containing the final value or the first error encountered.
 */
export function chain<T, E>(
	generator: () => AsyncGenerator<Err<never, E>, T, void>,
): ResultAsync<T, E>;
export function chain<T, E>(
	generator: () => Generator<Err<never, E>, T, void> | AsyncGenerator<Err<never, E>, T, void>,
): Result<T, E> | ResultAsync<T, E> {
	const iter = generator();
	// The iterator only needs to advance a single time, as `Ok` values are immediately returned
	// and `Err` values are yielded. This method short-circuits on the first error.
	const first = iter.next();

	if (first instanceof Promise) {
		const asyncIter = iter as AsyncGenerator<Err<never, E>, T, void>;

		return ResultAsync.fromPromise(
			(async () => {
				const next = await first;
				if (!next.done) {
					// Call `asyncIter.return` to ensure any cleanup is done.
					// We pass `undefined as T` because the actual value is irrelevant.
					await asyncIter.return?.(undefined as T);

					return next.value;
				}

				return ok(next.value);
			})(),
		);
	}

	const syncIter = iter as Generator<Err<never, E>, T, void>;
	const next = first;
	if (!next.done) {
		// Call `syncIter.return` to ensure any cleanup is done
		// We pass `undefined as T` because the actual value is irrelevant.
		syncIter.return?.(undefined as T);

		return next.value;
	}

	return ok(next.value);
}
