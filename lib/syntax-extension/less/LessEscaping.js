import { tokenTypes } from 'css-tree';

const STRING = tokenTypes.String;
const TILDE = 0x007E; // U+007E TILDE (~)

export const name = 'LessEscaping';
export const structure = {
    value: 'String'
};
export function parse() {
    const start = this.tokenStart;

    this.eatDelim(TILDE);

    return {
        type: 'LessEscaping',
        loc: this.getLocation(start, this.tokenEnd),
        value: this.consume(STRING)
    };
}
