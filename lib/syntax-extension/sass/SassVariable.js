const { tokenTypes } = require('css-tree');
const IDENT = tokenTypes.Ident;
const DOLLARSIGN = 0x0024; // U+0024 DOLLAR SIGN ($)

module.exports = {
    name: 'SassVariable',
    structure: {
        name: 'Identifier'
    },
    parse() {
        const start = this.tokenStart;

        this.eatDelim(DOLLARSIGN);

        return {
            type: 'SassVariable',
            loc: this.getLocation(start, this.tokenEnd),
            name: this.consume(IDENT)
        };
    }
};
