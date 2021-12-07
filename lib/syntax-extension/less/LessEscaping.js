const { tokenTypes } = require('css-tree');
const STRING = tokenTypes.String;
const TILDE = 0x007E; // U+007E TILDE (~)

module.exports = {
    name: 'LessEscaping',
    structure: {
        value: 'String'
    },
    parse() {
        const start = this.tokenStart;

        this.eatDelim(TILDE);

        return {
            type: 'LessEscaping',
            loc: this.getLocation(start, this.tokenEnd),
            value: this.consume(STRING)
        };
    }
};
