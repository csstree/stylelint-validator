// Reworked stylelint-rule-tester

const assert = require('assert');
const postcss = require('postcss');

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
 * @param {boolean} [testerOptions.printWarnings = false] - If `true`, the tester
 *   will print all the warnings that each test case produces.
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

        const ruleOptionsString = rulePrimaryOptions ? JSON.stringify(rulePrimaryOptions) : '';
        if (ruleOptionsString && ruleSecondaryOptions) {
            ruleOptionsString += ', ' + JSON.stringify(ruleSecondaryOptions);
        }

        describe(ruleName + (ruleOptionsString ? ' (options: ' + ruleOptionsString + ')' : ''), () => {
            cb({ ok, notOk });
        });

        /**
         * Checks that a CSS string is valid according to the
         * specified rule/options.
         *
         * @param {string} cssString
         * @param {string} [description]
         */
        function ok(cssString, description) {
            it(testTitleStr(cssString), () => {
                return postcssProcess(cssString).then(function(result) {
                    const warnings = result.warnings();

                    if (testerOptions.printWarnings) {
                        for (const { text } of warnings) {
                            console.warn('warning: ' + text);
                        }
                    }

                    assert.strictEqual(warnings.length, 0, description);
                })
            });
        }

        /**
         * Checks that a CSS string is INVALID according to the
         * specified rule/options -- i.e. that a warning is registered
         * with the expected warning message.
         *
         * @param {string} cssString
         * @param {string|object} expectedWarning
         * @param {string} [expectedWarning.message]
         * @param {string} [expectedWarning.line]
         * @param {string} [expectedWarning.column]
         * @param {string} [description]
         */
        function notOk(cssString, expectedWarning, description) {
            const expectedWarningMessage = typeof expectedWarning === 'string'
                ? expectedWarning
                : expectedWarning.message;

            it(testTitleStr(cssString), function() {
                return postcssProcess(cssString).then(function(result) {
                    const allActualWarnings = result.warnings();
                    const actualWarning = allActualWarnings[0];

                    if (testerOptions.printWarnings) {
                        for (const { text } of allActualWarnings) {
                            console.warn('warning: ' + text);
                        }
                    }

                    assert(allActualWarnings.length > 0, 'should warn');
                    assert.strictEqual(actualWarning.text, expectedWarningMessage);

                    if (typeof expectedWarning === 'object') {
                        if ('line' in expectedWarning) {
                            assert.strictEqual(actualWarning.line, expectedWarning.line, 'warning should be at line ' + expectedWarning.line);
                        }

                        if ('column' in expectedWarning) {
                            assert.strictEqual(actualWarning.column, expectedWarning.column, 'warning should be at column ' + expectedWarning.column);
                        }
                    }
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
                .process(cssString, testerOptions.postcssOptions);
        }

        function testTitleStr(css) {
            let result = testerOptions.escapeCss
                ? JSON.stringify(css)
                : '\n' + css;

            return result;
        }
    }
}

module.exports = ruleTester;

/**
 * The same as `ruleTester`, but sets the `printWarnings` option to `true`.
 */
module.exports.printWarnings = function(rule, ruleName, testerOptions) {
    testerOptions = testerOptions || {};
    testerOptions.printWarnings = true;
    return ruleTester(rule, ruleName, testerOptions);
}

