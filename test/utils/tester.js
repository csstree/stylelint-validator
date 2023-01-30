// Reworked stylelint-rule-tester

import assert, { deepStrictEqual } from 'assert';
import postcss from 'postcss';

const isRegExp = value => toString.call(value) === '[object RegExp]';

/**
 * Create a ruleTester for a specified rule.
 *
 * The ruleTester is a function accepting options and a callback.
 * The callback is passed on object exposing `ok` and `notOk` functions,
 * which check CSS strings against the rule configured with the specified options.
 *
 * @param {function} rule
 * @param {string} ruleName
 * @param {object} [testerOptions]
 * @param {function[]} [testerOptions.preceedingPlugins] - Array of PostCSS plugins to
 *   run the CSS string through *before* linting it
 * @param {boolean} [testerOptions.escapeCss = true] - If `false`, the CSS string printed
 *   to the console will not be escaped.
 *   This is useful if you want to read newlines and indentation.
 * @param {object} [testerOptions.postcssOptions] - An objects object passed
 *   to postcssProcessor.process().
 *   cf. https://github.com/postcss/postcss/blob/master/docs/api.md#processorprocesscss-opts
 * @return {function} ruleTester for the specified rule/options
 */
function ruleTester(rule, ruleName, testerOptions) {
    testerOptions = testerOptions || {};
    testerOptions.escapeCss = testerOptions.escapeCss !== false;

    return ruleTester;

    function ruleTester(rulePrimaryOptions, ruleSecondaryOptions, cb) {
        if (typeof ruleSecondaryOptions === 'function') {
            cb = ruleSecondaryOptions;
            ruleSecondaryOptions = null;
        }

        const ruleOptionsString = rulePrimaryOptions
            ? JSON.stringify(rulePrimaryOptions, (_, value) =>
                isRegExp(value) ? 'regexp:' + String(value) : value
            ).replace(/"regexp:(.*?)"/g, '$1')
            : '';
        if (ruleOptionsString && ruleSecondaryOptions) {
            ruleOptionsString += ', ' + JSON.stringify(ruleSecondaryOptions, (_, value) =>
                isRegExp(value) ? 'regexp:' + String(value) : value
            ).replace(/"regexp:(.*?)"/g, '$1');
        }

        const ok = Object.assign(createOkAssertFactory(it), {
            only: createOkAssertFactory(it.only),
            skip: createOkAssertFactory(it.skip)
        });
        const notOk = Object.assign(createFailureAssertFactory(it), {
            only: createFailureAssertFactory(it.only),
            skip: createFailureAssertFactory(it.skip)
        });

        describe(ruleName + (ruleOptionsString ? ' (options: ' + ruleOptionsString + ')' : ''), () => {
            cb({ ok, notOk });
        });

        // Checks that a CSS string is valid according to the specified rule/options.
        function createOkAssertFactory(it) {
            return (cssString, description) =>
                it(testTitleStr(cssString), () => {
                    return postcssProcess(cssString).then(function(result) {
                        const warnings = result.warnings().map(warn => ({
                            ...warn,
                            node: '<node>'
                        }));

                        deepStrictEqual(warnings, [], description);
                    });
                });
        }

        // Checks that a CSS string is INVALID according to the
        // specified rule/options -- i.e. that a warning is registered
        // with the expected warning message.
        function createFailureAssertFactory(it) {
            return (cssString, expected) =>
                it(testTitleStr(cssString), function() {
                    return postcssProcess(cssString).then(function(result) {
                        if (!Array.isArray(expected)) {
                            expected = [expected];
                        }

                        const expectedWarnings = expected.map(entry =>
                            typeof entry === 'string' ? { message: entry } : entry
                        );
                        const actualWarnings = result.warnings().map((entry, idx) => {
                            const result = { message: entry.text };
                            const shape = expectedWarnings[idx] || {};

                            for (let key in shape) {
                                if (key !== 'message') {
                                    result[key] = entry[key];
                                }
                            }

                            return result;
                        });

                        assert(actualWarnings.length > 0, 'should warn');
                        deepStrictEqual(actualWarnings, expectedWarnings);
                    });
                });
        }

        function postcssProcess(cssString) {
            const processor = postcss();

            if (testerOptions.preceedingPlugins) {
                testerOptions.preceedingPlugins.forEach(function(plugin) {
                    processor.use(plugin);
                });
            }

            return processor
                .use(rule(rulePrimaryOptions, ruleSecondaryOptions))
                .process(cssString, { from: undefined, ...testerOptions.postcssOptions });
        }

        function testTitleStr(css) {
            let result = testerOptions.escapeCss
                ? JSON.stringify(css)
                : '\n' + css;

            return result;
        }
    }
}

export default ruleTester;
