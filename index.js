var stylelint = require('stylelint');
var csstree = require('css-tree').fork(require('./syntax-extension'));
var syntax = csstree.lexer;

var ruleName = 'csstree/validator'
var messages = stylelint.utils.ruleMessages(ruleName, {
    parseError: function(value) {
        return 'Can\'t parse value "' + value + '"';
    },
    invalid: function(property) {
        return 'Invalid value for `' + property + '`';
    }
});

module.exports = stylelint.createPlugin(ruleName, function(options) {
    var ignore = false;
    options = options || {};

    if (Array.isArray(options.ignore)) {
        ignore = options.ignore.reduce(function(res, name) {
            res[name] = true;
            return res;
        }, Object.create(null));
    }

    return function(root, result) {
        root.walkDecls(function(decl) {
            var value;

            // ignore properties from ignore list
            if (ignore && ignore[decl.prop.toLowerCase()]) {
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
                    result: result,
                    ruleName: ruleName
                });
            }

            var match = syntax.matchProperty(decl.prop, value);
            var error = match.error;
            if (error) {
                var message = error.rawMessage || error.message || error;

                // ignore errors except those which make sense
                if (error.name !== 'SyntaxMatchError' &&
                    error.name !== 'SyntaxReferenceError') {
                    return;
                }

                if (message === 'Mismatch') {
                    message = messages.invalid(decl.prop);
                }

                stylelint.utils.report({
                    message: message,
                    node: decl,
                    result: result,
                    ruleName: ruleName
                });
            }
        });
    }
});

module.exports.ruleName = ruleName;
module.exports.messages = messages;
