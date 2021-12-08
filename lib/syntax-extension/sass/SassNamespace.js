import { tokenTypes } from 'css-tree';

const FUNCTION = tokenTypes.Function;
const IDENT = tokenTypes.Ident;
const DOLLARSIGN = 0x0024; // U+0024 DOLLAR SIGN ($)
const FULLSTOP = 0x002E;   // U+002E FULL STOP (.)

function consumeRaw() {
    return this.createSingleNodeList(
        this.Raw(this.tokenIndex, null, false)
    );
}

export const name = 'SassNamespace';
export const structure = {
    name: 'Identifier',
    member: ['Function', 'Ident']
};
export function parse() {
    const start = this.tokenStart;
    const name = this.consume(IDENT);
    let member;

    this.eatDelim(FULLSTOP);

    switch (this.tokenType) {
        case FUNCTION:
            member = this.Function(consumeRaw, this.scope.Value);
            break;

        default:
            if (this.isDelim(DOLLARSIGN)) {
                member = this.SassVariable();
            } else {
                this.error('Function or ident expected');
            }
    }

    return {
        type: 'SassNamespace',
        loc: this.getLocation(start, this.tokenEnd),
        name,
        member
    };
}
