import { List, tokenTypes } from 'css-tree';

const LEFTCURLYBRACKET = tokenTypes.LeftCurlyBracket;
const RIGHTCURLYBRACKET = tokenTypes.RightCurlyBracket;
const NUMBERSIGN = 0x0023; // U+0023 NUMBER SIGN (#)

export const name = 'SassInterpolation';
export const structure = {
    children: [[]]
};
export function parse(recognizer, readSequence) {
    const start = this.tokenStart;
    let children = new List();

    this.eatDelim(NUMBERSIGN);
    this.eat(LEFTCURLYBRACKET);
    children = readSequence.call(this, recognizer);
    this.eat(RIGHTCURLYBRACKET);

    return {
        type: 'SassInterpolation',
        loc: this.getLocation(start, this.tokenStart),
        children
    };
}
