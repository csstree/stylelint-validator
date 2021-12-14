import stylelint from 'stylelint';
import isStandardSyntaxAtRule from 'stylelint/lib/utils/isStandardSyntaxAtRule.js';
import isStandardSyntaxDeclaration from 'stylelint/lib/utils/isStandardSyntaxDeclaration.js';
import isStandardSyntaxProperty from 'stylelint/lib/utils/isStandardSyntaxProperty.js';
import isStandardSyntaxValue from 'stylelint/lib/utils/isStandardSyntaxValue.js';
import { fork } from 'css-tree';
import { less, sass } from './syntax-extension/index.js';

const { utils, createPlugin } = stylelint;
const csstree = fork(less).fork(sass);
const isRegExp = value => toString.call(value) === '[object RegExp]';
const getRaw = (node, name) => (node.raws && node.raws[name]) || '';

const ruleName = 'csstree/validator';
const messages = utils.ruleMessages(ruleName, {
    parseError: function(value) {
        return 'Can\'t parse value "' + value + '"';
    },
    invalidValue: function(property) {
        return 'Invalid value for `' + property + '`';
    },
    invalidPrelude: function(atrule) {
        return 'Invalid prelude for `@' + atrule + '`';
    }
});

const seenOptions = new WeakSet();
const plugin = createPlugin(ruleName, function(options) {
    options = options || {};

    const optionIgnoreProperties = options.ignoreProperties || options.ignore;

    if (options.ignore && !seenOptions.has(options)) {
        console.warn(`[${ruleName}] "ignore" option is deprecated and will be removed in future versions, use "ignoreProperties" instead`);
        seenOptions.add(options);
    }

    const ignoreValue = options.ignoreValue && (typeof options.ignoreValue === 'string' || isRegExp(options.ignoreValue))
        ? new RegExp(options.ignoreValue)
        : false;
    const ignoreProperties = Array.isArray(optionIgnoreProperties)
        ? new Set(optionIgnoreProperties.map(name => String(name).toLowerCase()))
        : false;
    const ignoreAtrules = Array.isArray(options.ignoreAtrules)
        ? new Set(options.ignoreAtrules.map(name => String(name).toLowerCase()))
        : false;
    const atrulesValidationDisabled = options.atrules === false;
    const syntax = !options.properties && !options.types && !options.atrules
        ? csstree.lexer // default syntax
        : csstree.fork({
            properties: options.properties,
            types: options.types,
            atrules: options.atrules
        }).lexer;

    return function(root, result) {
        const ignoreAtruleNodes = new WeakSet();

        root.walkAtRules(function(atrule) {
            let error;

            // ignore non-standard at-rules
            if (!isStandardSyntaxAtRule(atrule)) {
                return;
            }

            // at-rule validation is disabled
            if (atrulesValidationDisabled) {
                ignoreAtruleNodes.add(atrule);
                return;
            }

            if (ignoreAtrules !== false && ignoreAtrules.has(atrule.name)) {
                ignoreAtruleNodes.add(atrule);
                return;
            }

            if (error = syntax.checkAtruleName(atrule.name)) {
                ignoreAtruleNodes.add(atrule);
                utils.report({
                    ruleName,
                    result,
                    message: error.message,
                    node: atrule
                });

                return;
            }

            if (error = syntax.matchAtrulePrelude(atrule.name, atrule.params).error) {
                let message = error.rawMessage || error.message;
                let index = 2 + atrule.name.length + getRaw('afterName').length;

                if (message === 'Mismatch') {
                    message = messages.invalidPrelude(atrule.name);
                    index += error.mismatchOffset;
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
            if (ignoreProperties !== false && ignoreProperties.has(decl.prop.toLowerCase())) {
                return;
            }

            // ignore declarations with non-standard syntax (Less, Sass, etc)
            if (!isStandardSyntaxDeclaration(decl) ||
                !isStandardSyntaxProperty(decl.prop) ||
                !isStandardSyntaxValue(decl.value)) {
                return;
            }

            try {
                csstree.parse(decl.value, {
                    context: 'value',
                    property: decl.prop
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
                ? syntax.matchAtruleDescriptor(decl.parent.name, decl.prop, decl.value)
                : syntax.matchProperty(decl.prop, decl.value);

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
