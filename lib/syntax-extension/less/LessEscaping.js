const { tokenTypes } = require('css-tree');
const STRING = tokenTypes.String;
const TILDE = 0x007E; // U+007E TILDE (~)

module.exports = {
    name: 'LessEscaping',
    structure: {
        value: 'String'
    },
    parse: function LessEscaping() {
        const start = this.tokenStart;

        if (!this.isDelim(TILDE)) {
            this.error('Tilde is expected');
        }

        this.next();

        return {
            type: 'LessEscaping',
            loc: this.getLocation(start, this.tokenEnd),
            value: this.consume(STRING)
        };
    }
};
