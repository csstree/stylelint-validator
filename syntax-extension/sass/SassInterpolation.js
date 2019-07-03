var List = require('css-tree').List;
var tokenize = require('css-tree').tokenize;
var TYPE = tokenize.TYPE;
var LEFTCURLYBRACKET = TYPE.LeftCurlyBracket;
var RIGHTCURLYBRACKET = TYPE.RightCurlyBracket;
var NUMBERSIGN = tokenize.CHARCODE.NumberSign;

module.exports = {
    name: 'SassInterpolation',
    structure: {
        children: [[]]
    },
    parse: function SassInterpolation(recognizer, readSequence) {
        var start = this.scanner.tokenStart;
        var children = new List();

        if (!this.scanner.isDelim(NUMBERSIGN)) {
            this.error();
        }

        this.scanner.next();
        this.eat(LEFTCURLYBRACKET);
        children = readSequence.call(this, recognizer);
        this.eat(RIGHTCURLYBRACKET);

        return {
            type: 'SassInterpolation',
            loc: this.getLocation(start, this.scanner.tokenStart),
            children: children
        };
    }
};
