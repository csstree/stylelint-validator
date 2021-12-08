import { tokenTypes } from 'css-tree';

const ATKEYWORD = tokenTypes.AtKeyword;

export const name = 'LessVariable';
export const structure = {
    name: 'Identifier'
};
export function parse() {
    const start = this.tokenStart;

    this.eat(ATKEYWORD);

    return {
        type: 'LessVariable',
        loc: this.getLocation(start, this.tokenEnd),
        name: this.substrToCursor(start + 1)
    };
}
