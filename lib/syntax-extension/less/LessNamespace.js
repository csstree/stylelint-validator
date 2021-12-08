import { tokenTypes } from 'css-tree';

const HASH = tokenTypes.Hash;
const FUNCTION = tokenTypes.Function;
const IDENT = tokenTypes.Ident;
const FULLSTOP = 0x002E;        // U+002E FULL STOP (.)
const GREATERTHANSIGN = 0x003E; // U+003E GREATER-THAN SIGN (>)

function consumeRaw() {
    return this.createSingleNodeList(
        this.Raw(this.tokenIndex, null, false)
    );
}

export const name = 'LessNamespace';
export const structure = {
    name: 'Identifier',
    member: ['Function', 'Identifier']
};
export function parse() {
    const start = this.tokenStart;
    const name = this.consume(HASH).substr(1);
    let member;

    this.skipSC(); // deprecated


    // deprecated
    if (this.isDelim(GREATERTHANSIGN)) {
        this.next();
        this.skipSC();
    }

    this.eatDelim(FULLSTOP);

    switch (this.tokenType) {
        case FUNCTION:
            member = this.Function(consumeRaw, this.scope.Value);
            break;

        case IDENT:
            member = this.Identifier();
            break;

        default:
            this.error('Function or ident expected');
    }

    return {
        type: 'LessNamespace',
        loc: this.getLocation(start, this.tokenEnd),
        name,
        member
    };
}
