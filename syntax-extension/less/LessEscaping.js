var TYPE = require('css-tree').Tokenizer.TYPE;
var STRING = TYPE.String;
var TILDE = TYPE.Tilde;

module.exports = function LessEscaping() {
    var start = this.scanner.tokenStart;

    this.scanner.eat(TILDE);

    return {
        type: 'LessEscaping',
        loc: this.getLocation(start, this.scanner.tokenEnd),
        value: this.scanner.consume(STRING)
    };
};
