import { deepStrictEqual, strictEqual } from 'assert';
import stylelint from 'stylelint';
import validator from 'stylelint-csstree-validator';

for (const plugin of ['stylelint-csstree-validator', validator]) {
    describe(typeof plugin === 'string' ? 'Plugin configuration' : 'Plugin export', function() {
        const config = {
            plugins: [plugin],
            rules: { 'csstree/validator': true }
        };

        it('accepts valid CSS', async function() {
            const result = await stylelint.lint({
                code: '@media screen { a { color: red } }',
                config
            });

            strictEqual(result.errored, false);
            deepStrictEqual(result.results[0].warnings, []);
        });

        it('reports an invalid declaration value', async function() {
            const result = await stylelint.lint({ code: 'a { color: red green }', config });

            strictEqual(result.errored, true);
            deepStrictEqual(result.results[0].warnings.map(({ rule, text }) => ({ rule, text })), [{
                rule: 'csstree/validator',
                text: 'Invalid value for "color" (csstree/validator)'
            }]);
        });

        it('reports an unknown at-rule', async function() {
            const result = await stylelint.lint({ code: '@unknown {}', config });

            strictEqual(result.errored, true);
            deepStrictEqual(result.results[0].warnings.map(({ rule, text }) => ({ rule, text })), [{
                rule: 'csstree/validator',
                text: 'Unknown at-rule `@unknown` (csstree/validator)'
            }]);
        });
    });
}
