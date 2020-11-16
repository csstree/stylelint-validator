const stylelint = require('stylelint');
const csstree = require('css-tree').fork(require('./syntax-extension'));

const ruleName = 'csstree/validator'
const messages = stylelint.utils.ruleMessages(ruleName, {
    parseError: function(value) {
        return 'Can\'t parse value "' + value + '"';
    },
    invalid: function(property) {
        return 'Invalid value for `' + property + '`';
    }
});

module.exports = stylelint.createPlugin(ruleName, function(options) {
    options = options || {};

    const ignoreValue = options.ignoreValue && (typeof options.ignoreValue === 'string' || toString.call(options.ignoreValue) === '[object RegExp]')
        ? new RegExp(options.ignoreValue)
        : false;
    const ignore = Array.isArray(options.ignore)
        ? new Set(options.ignore.map(name => String(name).toLowerCase()))
        : false;
    const syntax = !options.properties && !options.types
        ? csstree.lexer // default syntax
        : csstree.fork((syntaxConfig) => { // syntax with custom properties or/and types
            for (const [name, value] of Object.entries(options.properties || {})) {
                syntaxConfig.properties[name] = value
                    .replace(/^\s*\|/, (m, index) => syntaxConfig.properties[name]
                        ? syntaxConfig.properties[name] + ' |'
                        : ''
                    );
            }

            for (const [name, value] of Object.entries(options.types || {})) {
                syntaxConfig.types[name] = value
                    .replace(/^\s*\|/, (m, index) => syntaxConfig.types[name]
                        ? syntaxConfig.types[name] + ' |'
                        : ''
                );
            }

            return syntaxConfig;
        }).lexer;

    return function(root, result) {
        root.walkDecls(function(decl) {
            let value;

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
                value = csstree.parse(decl.value, {
                    context: 'value',
                    property: decl.prop
                });
            } catch (e) {
                // ignore values with preprocessor's extensions
                if (e.type === 'PreprocessorExtensionError') {
                    return;
                }

                return stylelint.utils.report({
                    message: messages.parseError(decl.value),
                    node: decl,
                    result,
                    ruleName
                });
            }

            const { error } = syntax.matchProperty(decl.prop, value);
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

                    message = messages.invalid(decl.prop);
                    index = decl.prop.length + ((decl.raws && decl.raws.between) || '').length + error.mismatchOffset;
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
    }
});

module.exports.ruleName = ruleName;
module.exports.messages = messages;
