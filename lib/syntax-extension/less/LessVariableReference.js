import { tokenTypes } from 'css-tree';

const ATRULE = tokenTypes.AtKeyword;
const COMMERCIALAT = 0x0040; // U+0040 COMMERCIAL AT (@)

export const name = 'LessVariableReference';
export const structure = {
    name: 'Identifier'
};
export function parse() {
    const start = this.tokenStart;

    this.eatDelim(COMMERCIALAT);
    this.eat(ATRULE);

    return {
        type: 'LessVariableReference',
        loc: this.getLocation(start, this.tokenEnd),
        name: this.substrToCursor(start + 2)
    };
}
