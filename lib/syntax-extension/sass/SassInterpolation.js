const { List, tokenTypes } = require('css-tree');
const LEFTCURLYBRACKET = tokenTypes.LeftCurlyBracket;
const RIGHTCURLYBRACKET = tokenTypes.RightCurlyBracket;
const NUMBERSIGN = 0x0023; // U+0023 NUMBER SIGN (#)

module.exports = {
    name: 'SassInterpolation',
    structure: {
        children: [[]]
    },
    parse: function SassInterpolation(recognizer, readSequence) {
        const start = this.tokenStart;
        let children = new List();

        if (!this.isDelim(NUMBERSIGN)) {
            this.error();
        }

        this.next();
        this.eat(LEFTCURLYBRACKET);
        children = readSequence.call(this, recognizer);
        this.eat(RIGHTCURLYBRACKET);

        return {
            type: 'SassInterpolation',
            loc: this.getLocation(start, this.tokenStart),
            children
        };
    }
};
