import { afterAll, describe, test } from "bun:test";
import { RuleTester } from "@typescript-eslint/rule-tester";

RuleTester.describe = describe;
RuleTester.describeSkip = describe.skip;
RuleTester.it = test;
RuleTester.itSkip = test.skip;
RuleTester.afterAll = afterAll;

export const ruleTester = new RuleTester({
	languageOptions: {
		parserOptions: {
			projectService: {
				allowDefaultProject: ["*.ts"],
			},
			tsconfigRootDir: import.meta.dirname,
		},
	},
});
