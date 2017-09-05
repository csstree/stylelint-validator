var List = require('css-tree').List;
var TYPE = require('css-tree').Tokenizer.TYPE;
var NUMBERSIGN = TYPE.NumberSign;
var LEFTCURLYBRACKET = TYPE.LeftCurlyBracket;
var RIGHTCURLYBRACKET = TYPE.RightCurlyBracket;

module.exports = {
    name: 'SassInterpolation',
    structure: {
        children: [[]]
    },
    parse: function SassInterpolation(recognizer, readSequence) {
        var start = this.scanner.tokenStart;
        var children = new List();

        this.scanner.eat(NUMBERSIGN);
        this.scanner.eat(LEFTCURLYBRACKET);
        children = readSequence.call(this, recognizer);
        this.scanner.eat(RIGHTCURLYBRACKET);

        return {
            type: 'SassInterpolation',
            loc: this.getLocation(start, this.scanner.tokenStart),
            children: children
        };
    }
};
