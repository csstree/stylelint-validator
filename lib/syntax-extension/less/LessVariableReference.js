const { tokenTypes } = require('css-tree');
const ATRULE = tokenTypes.AtKeyword;
const COMMERCIALAT = 0x0040; // U+0040 COMMERCIAL AT (@)

module.exports = {
    name: 'LessVariableReference',
    structure: {
        name: 'Identifier'
    },
    parse() {
        const start = this.tokenStart;

        this.eatDelim(COMMERCIALAT);
        this.eat(ATRULE);

        return {
            type: 'LessVariableReference',
            loc: this.getLocation(start, this.tokenEnd),
            name: this.substrToCursor(start + 2)
        };
    }
};
