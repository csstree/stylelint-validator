var TYPE = require('css-tree').Tokenizer.TYPE;
var IDENTIFIER = TYPE.Identifier;
var COMMERCIALAT = TYPE.CommercialAt;

module.exports = function LessVariableReference() {
    var start = this.scanner.tokenStart;

    this.scanner.eat(COMMERCIALAT);
    this.scanner.eat(COMMERCIALAT);

    return {
        type: 'LessVariableReference',
        loc: this.getLocation(start, this.scanner.tokenEnd),
        name: this.scanner.consume(IDENTIFIER)
    };
};
