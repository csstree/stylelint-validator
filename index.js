var stylelint = require('stylelint');
var csstree = require('css-tree');
var syntax = csstree.syntax.defaultSyntax;
var parser = new csstree.Parser();
var TYPE = csstree.Tokenizer.TYPE;

var ruleName = 'csstree/validator'
var messages = stylelint.utils.ruleMessages(ruleName, {
    parseError: function(value) {
        return 'Can\'t parse value "' + value + '"';
    },
    invalid: function(property) {
        return 'Invalid value for `' + property + '`';
    },
    uncomplete: function(property) {
        return 'The rest part of value can\'t to be matched on `' + property + '` syntax';
    }
});

// custom 
var PreprocessorExtensionError = function() {
    this.type = 'PreprocessorExtensionError';
};

// extend parser value parser
parser.readSequenceFallback = function() {
    switch (this.scanner.tokenType) {
        // less
        case TYPE.CommercialAt: // @var
        case TYPE.Tilde:        // ~"asd" ~'asd'
        // sass
        case TYPE.PercentSign:  // 5 % 4
        case TYPE.DollarSign:   // $var
            throw new PreprocessorExtensionError();
    }
};

module.exports = stylelint.createPlugin(ruleName, function() {
    return function(root, result) {
        root.walkDecls(function(decl) {
            var value;

            try {
                value = parser.parse(decl.value, {
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

            if (!syntax.matchProperty(decl.prop, value)) {
                var error = syntax.lastMatchError;
                var message = error.rawMessage || error.message || error;

                if (message === 'Mismatch') {
                    message = messages.invalid(decl.prop);
                } else if (message === 'Uncomplete match') {
                    message = messages.uncomplete(decl.prop);
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
