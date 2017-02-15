var TYPE = require('css-tree').Tokenizer.TYPE;
var IDENTIFIER = TYPE.Identifier;
var COMMERCIALAT = TYPE.CommercialAt;

module.exports = function LessVariable() {
    var start = this.scanner.tokenStart;

    this.scanner.eat(COMMERCIALAT);

    return {
        type: 'LessVariable',
        loc: this.getLocation(start, this.scanner.tokenEnd),
        name: this.scanner.consume(IDENTIFIER)
    };
};
