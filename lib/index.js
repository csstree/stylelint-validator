import stylelint from 'stylelint';
import isStandardSyntaxAtRule from 'stylelint/lib/utils/isStandardSyntaxAtRule.js';
import isStandardSyntaxDeclaration from 'stylelint/lib/utils/isStandardSyntaxDeclaration.js';
import isStandardSyntaxProperty from 'stylelint/lib/utils/isStandardSyntaxProperty.js';
import isStandardSyntaxValue from 'stylelint/lib/utils/isStandardSyntaxValue.js';
import { fork, lexer, parse } from 'css-tree';
import { less, sass } from './syntax-extension/index.js';

const { utils, createPlugin } = stylelint;
const isRegExp = value => toString.call(value) === '[object RegExp]';
const getRaw = (node, name) => (node.raws && node.raws[name]) || '';
const allowedSyntaxExtensions = new Set(['less', 'sass']);
const lessExtendedSyntax = fork(less);
const sassExtendedSyntax = fork(sass);
const syntaxExtensions = {
    none: { fork, lexer, parse },
    less: lessExtendedSyntax,
    sass: sassExtendedSyntax,
    all: fork(less).fork(sass)
};

const ruleName = 'csstree/validator';
const messages = utils.ruleMessages(ruleName, {
    csstree(value) {
        return value;
    },
    parseError(value) {
        return 'Can\'t parse value "' + value + '"';
    },
    unknownAtrule(atrule) {
        return 'Unknown at-rule `@' + atrule + '`';
    },
    invalidPrelude(atrule) {
        return 'Invalid prelude for `@' + atrule + '`';
    },
    unknownProperty(property) {
        return 'Unknown property `' + property + '`';
    },
    invalidValue(property) {
        return 'Invalid value for "' + property + '"';
    }
});

function createIgnoreMatcher(patterns) {
    if (Array.isArray(patterns)) {
        const names = new Set();
        const regexpes = [];

        for (let pattern of patterns) {
            if (typeof pattern === 'string') {
                const stringifiedRegExp = pattern.match(/^\/(.+)\/([a-z]*)/);

                if (stringifiedRegExp) {
                    regexpes.push(new RegExp(stringifiedRegExp[1], stringifiedRegExp[2]));
                } else if (/[^a-z0-9\-]/i.test(pattern)) {
                    regexpes.push(new RegExp(`^(${pattern})$`, 'i'));
                } else {
                    names.add(pattern.toLowerCase());
                }
            } else if (isRegExp(pattern)) {
                regexpes.push(pattern);
            }
        }

        const matchRegExpes = regexpes.length
            ? name => regexpes.some(pattern => pattern.test(name))
            : null;

        if (names.size > 0) {
            return matchRegExpes !== null
                ? name => names.has(name.toLowerCase()) || matchRegExpes(name)
                : name => names.has(name.toLowerCase());
        } else if (matchRegExpes !== null) {
            return matchRegExpes;
        }
    }

    return false;
}

const plugin = createPlugin(ruleName, function(options) {
    options = options || {};

    const optionSyntaxExtension = new Set(Array.isArray(options.syntaxExtensions) ? options.syntaxExtensions : []);

    const ignoreValue = options.ignoreValue && (typeof options.ignoreValue === 'string' || isRegExp(options.ignoreValue))
        ? new RegExp(options.ignoreValue)
        : false;
    const ignoreProperties = createIgnoreMatcher(options.ignoreProperties || options.ignore);
    const ignoreAtrules = createIgnoreMatcher(options.ignoreAtrules);
    const atrulesValidationDisabled = options.atrules === false;
    const syntax = optionSyntaxExtension.has('less')
        ? optionSyntaxExtension.has('sass')
            ? syntaxExtensions.all
            : syntaxExtensions.less
        : optionSyntaxExtension.has('sass')
            ? syntaxExtensions.sass
            : syntaxExtensions.none;
    const lexer = !options.properties && !options.types && !options.atrules
        ? syntax.lexer // default syntax
        : syntax.fork({
            properties: options.properties || {},
            types: options.types || {},
            atrules: options.atrules || {}
        }).lexer;

    return function(root, result) {
        const ignoreAtruleNodes = new WeakSet();

        stylelint.utils.validateOptions(result, ruleName, {
            actual: {
                ignore: options.ignore,
                syntaxExtensions: [...optionSyntaxExtension]
            },
            possible: {
                ignore: value => value === undefined,
                syntaxExtensions: value => allowedSyntaxExtensions.has(value)
            }
        });

        root.walkAtRules(function(atrule) {
            let error;

            // ignore non-standard at-rules
            if (syntax !== syntaxExtensions.none && !isStandardSyntaxAtRule(atrule)) {
                return;
            }

            // at-rule validation is disabled
            if (atrulesValidationDisabled) {
                ignoreAtruleNodes.add(atrule);
                return;
            }

            if (ignoreAtrules !== false && ignoreAtrules(atrule.name)) {
                ignoreAtruleNodes.add(atrule);
                return;
            }

            if (error = lexer.checkAtruleName(atrule.name)) {
                ignoreAtruleNodes.add(atrule);
                utils.report({
                    ruleName,
                    result,
                    message: messages.csstree(error.message),
                    node: atrule
                });

                return;
            }

            if (error = lexer.matchAtrulePrelude(atrule.name, atrule.params).error) {
                let message = error.rawMessage || error.message;
                let index = 2 + atrule.name.length + getRaw('afterName').length;

                if (message === 'Mismatch') {
                    // ignore mismatch errors for a prelude with syntax extensions
                    if (syntax !== syntaxExtensions.none && atrule.params) {
                        try {
                            syntax.parse(atrule.params, {
                                atrule: 'unknown', // to use default parsing rules
                                context: 'atrulePrelude'
                            });
                        } catch (e) {
                            if (e.type === 'PreprocessorExtensionError') {
                                return;
                            }
                        }
                    }

                    message = messages.invalidPrelude(atrule.name);
                    index += error.mismatchOffset;
                } else {
                    message = messages.csstree(message);
                }

                utils.report({
                    ruleName,
                    result,
                    message,
                    node: atrule,
                    index
                });
            }
        });

        root.walkDecls((decl) => {
            // don't check for descriptors in bad at-rules
            if (ignoreAtruleNodes.has(decl.parent)) {
                return;
            }

            // ignore properties from ignore list
            if (ignoreProperties !== false && ignoreProperties(decl.prop)) {
                return;
            }

            // ignore declarations with non-standard syntax (Less, Sass, etc)
            if (syntax !== syntaxExtensions.none) {
                if (!isStandardSyntaxDeclaration(decl) ||
                    !isStandardSyntaxProperty(decl.prop) ||
                    !isStandardSyntaxValue(decl.value)) {
                    return;
                }
            }

            try {
                syntax.parse(decl.value, {
                    context: 'value'
                });
            } catch (e) {
                // ignore values with preprocessor's extensions
                if (e.type === 'PreprocessorExtensionError') {
                    return;
                }

                // ignore values by a pattern
                if (ignoreValue && ignoreValue.test(decl.value)) {
                    return;
                }

                return utils.report({
                    message: messages.parseError(decl.value),
                    node: decl,
                    result,
                    ruleName
                });
            }

            const { error } = decl.parent.type === 'atrule'
                ? lexer.matchAtruleDescriptor(decl.parent.name, decl.prop, decl.value)
                : lexer.matchProperty(decl.prop, decl.value);

            if (error) {
                let message = error.rawMessage || error.message || error;
                let index = undefined;

                // ignore errors except those which make sense
                if (error.name !== 'SyntaxMatchError' &&
                    error.name !== 'SyntaxReferenceError') {
                    return;
                }

                if (message === 'Mismatch') {
                    // ignore values by a pattern
                    if (ignoreValue && ignoreValue.test(decl.value)) {
                        return;
                    }

                    message = messages.invalidValue(decl.prop);
                    index = decl.prop.length + getRaw(decl, 'between').length + error.mismatchOffset;
                } else {
                    message = messages.csstree(message);
                }

                utils.report({
                    ruleName,
                    result,
                    message,
                    node: decl,
                    index
                });
            }
        });
    };
});

export default Object.assign(plugin, {
    ruleName,
    messages
});
