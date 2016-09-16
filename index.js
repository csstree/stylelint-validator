var stylelint = require('stylelint');
var csstree = require('css-tree');
var syntax = csstree.syntax.defaultSyntax;

var ruleName = 'csstree/validator'
var messages = stylelint.utils.ruleMessages(ruleName, {
    parseValue: function(value) {
        return 'Can\'t parse value "' + value + '"';
    }
})

module.exports = stylelint.createPlugin(ruleName, function(enabled) {
    return function(root, result) {

        var validOptions = stylelint.utils.validateOptions(result, ruleName, {
            actual: enabled,
            possible: [true, false]
        });

        if (!validOptions) {
            return;
        }

        root.walkDecls(function(decl) {
            var value;

            try {
                value = csstree.parse(decl.value, {
                    context: 'value',
                    pproperty: decl.prop
                });
            } catch (e) {
                return stylelint.utils.report({
                    message: messages.parseValue(decl.value),
                    node: decl,
                    result: result,
                    ruleName: ruleName
                });
            }

            if (!syntax.match(decl.prop, value)) {
                var error = syntax.lastMatchError;
                var message = error.rawMessage || error.message || error;

                if (message === 'Mismatch') {
                    message = 'Bad value for `' + decl.prop + '`';
                } else if (message === 'Uncomplete match') {
                    message = 'The rest part of value can\'t to be matched on `' + decl.prop + '` syntax';
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
