const { tokenTypes } = require('css-tree');
const ATRULE = tokenTypes.AtKeyword;
const COMMERCIALAT = 0x0040; // U+0040 COMMERCIAL AT (@)

module.exports = {
    name: 'LessVariableReference',
    structure: {
        name: 'Identifier'
    },
    parse: function LessVariableReference() {
        const start = this.tokenStart;

        if (!this.isDelim(COMMERCIALAT)) {
            this.error();
        }

        this.next();
        this.eat(ATRULE);

        return {
            type: 'LessVariableReference',
            loc: this.getLocation(start, this.tokenEnd),
            name: this.substrToCursor(start + 2)
        };
    }
};
