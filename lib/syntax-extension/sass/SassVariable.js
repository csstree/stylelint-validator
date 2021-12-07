const { tokenTypes } = require('css-tree');
const IDENT = tokenTypes.Ident;
const DOLLARSIGN = 0x0024; // U+0024 DOLLAR SIGN ($)

module.exports = {
    name: 'SassVariable',
    structure: {
        name: 'Identifier'
    },
    parse: function SassVariable() {
        const start = this.tokenStart;

        if (!this.isDelim(DOLLARSIGN)) {
            this.error();
        }

        this.next();

        return {
            type: 'SassVariable',
            loc: this.getLocation(start, this.tokenEnd),
            name: this.consume(IDENT)
        };
    }
};
