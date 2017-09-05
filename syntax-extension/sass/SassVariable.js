var TYPE = require('css-tree').Tokenizer.TYPE;
var IDENTIFIER = TYPE.Identifier;
var DOLLARSIGN = TYPE.DollarSign;

module.exports = {
    name: 'SassVariable',
    structure: {
        name: 'Identifier'
    },
    parse: function SassVariable() {
        var start = this.scanner.tokenStart;

        this.scanner.eat(DOLLARSIGN);

        return {
            type: 'SassVariable',
            loc: this.getLocation(start, this.scanner.tokenEnd),
            name: this.scanner.consume(IDENTIFIER)
        };
    }
};
