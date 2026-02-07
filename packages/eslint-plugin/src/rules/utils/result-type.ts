import ts from "typescript";

const RESULT_TYPE_NAMES = new Set(["Ok", "Err", "ResultAsync"]);

/**
 * Determines whether a type originates from antithrow's `Result` family.
 *
 * `Result<T, E>` is a union of `Ok<T, E> | Err<T, E>`, so we recurse into
 * union members. We also guard against `any`/`unknown`/`never` to avoid
 * false positives on untyped code. Finally, we verify the symbol's
 * declaration lives inside the `antithrow` package so that unrelated types
 * with the same names (e.g. a user-defined `Ok` class) are not flagged.
 */
export function isResultType(type: ts.Type): boolean {
	if (type.isUnion()) {
		return type.types.some((t) => isResultType(t));
	}

	const flags = type.getFlags();
	if (flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown | ts.TypeFlags.Never)) {
		return false;
	}

	const symbol = type.getSymbol();
	if (!symbol || !RESULT_TYPE_NAMES.has(symbol.getName())) {
		return false;
	}

	const declarations = symbol.getDeclarations() ?? [];

	return declarations.some((decl) => {
		const sourceFile = decl.getSourceFile();
		return sourceFile.fileName.includes("antithrow");
	});
}
