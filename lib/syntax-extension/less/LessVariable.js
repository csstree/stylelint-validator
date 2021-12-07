const { tokenTypes } = require('css-tree');
const ATKEYWORD = tokenTypes.AtKeyword;

module.exports = {
    name: 'LessVariable',
    structure: {
        name: 'Identifier'
    },
    parse: function LessVariable() {
        const start = this.tokenStart;

        this.eat(ATKEYWORD);

        return {
            type: 'LessVariable',
            loc: this.getLocation(start, this.tokenEnd),
            name: this.substrToCursor(start + 1)
        };
    }
};
