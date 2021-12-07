const stylelint = require('stylelint');
const csstree = require('css-tree').fork(require('./syntax-extension'));

const ruleName = 'csstree/validator';
const messages = stylelint.utils.ruleMessages(ruleName, {
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

const isRegExp = value => toString.call(value) === '[object RegExp]';
const getRaw = (node, name) => (node.raws && node.raws[name]) || '';

module.exports = stylelint.createPlugin(ruleName, function(options) {
    options = options || {};

    const ignoreValue = options.ignoreValue && (typeof options.ignoreValue === 'string' || isRegExp(options.ignoreValue))
        ? new RegExp(options.ignoreValue)
        : false;
    const ignore = Array.isArray(options.ignore)
        ? new Set(options.ignore.map(name => String(name).toLowerCase()))
        : false;
    const syntax = !options.properties && !options.types
        ? csstree.lexer // default syntax
        : csstree.fork({
            properties: options.properties,
            types: options.types,
            atrules: options.atrules
        }).lexer;

    return function(root, result) {
        const badAtrules = new WeakSet();

        root.walkAtRules(function(atrule) {
            let error;

            // less variables
            if (atrule.variable) {
                return;
            }

            if (error = syntax.checkAtruleName(atrule.name)) {
                badAtrules.add(atrule);
                stylelint.utils.report({
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

                stylelint.utils.report({
                    ruleName,
                    result,
                    message,
                    node: atrule,
                    index
                });
            }
        });

        root.walkDecls(function(decl) {
            // don't check for descriptors in bad at-rules
            if (badAtrules.has(decl.parent)) {
                return;
            }

            // ignore properties from ignore list
            if (ignore && ignore.has(decl.prop.toLowerCase())) {
                return;
            }

            // ignore properocessor's var declarations (since postcss treats it as declarations)
            // and declarations with property names that contain interpolation
            if (/[#$@]/.test(decl.prop)) {
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

                return stylelint.utils.report({
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

                stylelint.utils.report({
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

module.exports.ruleName = ruleName;
module.exports.messages = messages;
