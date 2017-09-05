var TYPE = require('css-tree').Tokenizer.TYPE;
var COMMERCIALAT = TYPE.CommercialAt;
var ATRULE = TYPE.Atrule;

module.exports = {
    name: 'LessVariableReference',
    structure: {
        name: 'Identifier'
    },
    parse: function LessVariableReference() {
        var start = this.scanner.tokenStart;

        this.scanner.eat(COMMERCIALAT);
        this.scanner.eat(ATRULE);

        return {
            type: 'LessVariableReference',
            loc: this.getLocation(start, this.scanner.tokenEnd),
            name: this.scanner.substrToCursor(start + 2)
        };
    }
};
