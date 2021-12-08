import { tokenTypes as TYPE } from 'css-tree';
import * as LessVariableReference from './less/LessVariableReference.js';
import * as LessVariable from './less/LessVariable.js';
import * as LessEscaping from './less/LessEscaping.js';
import * as LessNamespace from './less/LessNamespace.js';
import * as SassVariable from './sass/SassVariable.js';
import * as SassInterpolation from './sass/SassInterpolation.js';
import * as SassNamespace from './sass/SassNamespace.js';

const NUMBERSIGN = 0x0023;      // U+0023 NUMBER SIGN (#)
const DOLLARSIGN = 0x0024;      // U+0024 DOLLAR SIGN ($)
const PERCENTAGESIGN = 0x0025;  // U+0025 PERCENTAGE SIGN (%)
const FULLSTOP = 0x002E;        // U+002E FULL STOP (.)
const GREATERTHANSIGN = 0x003E; // U+003E GREATER-THAN SIGN (>)
const COMMERCIALAT = 0x0040;    // U+0040 COMMERCIAL AT (@)
const TILDE = 0x007E;           // U+007E TILDE (~)

// custom error
class PreprocessorExtensionError {
    constructor() {
        this.type = 'PreprocessorExtensionError';
    }
}

export default function extendParser(syntaxConfig) {
    // new node types
    syntaxConfig.node.LessVariableReference = LessVariableReference;
    syntaxConfig.node.LessVariable = LessVariable;
    syntaxConfig.node.LessEscaping = LessEscaping;
    syntaxConfig.node.LessNamespace = LessNamespace;
    syntaxConfig.node.SassVariable = SassVariable;
    syntaxConfig.node.SassInterpolation = SassInterpolation;
    syntaxConfig.node.SassNamespace = SassNamespace;

    // extend parser value parser
    const originalGetNode = syntaxConfig.scope.Value.getNode;
    syntaxConfig.scope.Value.getNode = function(context) {
        let node = null;

        switch (this.tokenType) {
            case TYPE.AtKeyword:    // less: @var
                node = this.LessVariable();
                break;

            case TYPE.Ident:
                if (this.isDelim(FULLSTOP, 1)) {
                    node = this.SassNamespace();
                }
                break;

            case TYPE.Hash: {
                let sc = 0;
                let tokenType = 0;

                // deprecated
                do {
                    tokenType = this.lookupType(++sc);
                    if (tokenType !== TYPE.WhiteSpace && tokenType !== TYPE.Comment) {
                        break;
                    }
                } while (tokenType !== TYPE.EOF);

                if (this.isDelim(FULLSTOP, sc) ||     /* preferred  */
                    this.isDelim(GREATERTHANSIGN, sc) /* deprecated */) {
                    node = this.LessNamespace();
                }

                break;
            }

            case TYPE.Delim:
                switch (this.source.charCodeAt(this.tokenStart)) {
                    case COMMERCIALAT: // less: @@var
                        if (this.lookupType(1) === TYPE.AtKeyword) {
                            node = this.LessVariableReference();
                        }
                        break;

                    case TILDE:        // less: ~"asd" | ~'asd'
                        node = this.LessEscaping();
                        break;

                    case DOLLARSIGN:   // sass: $var
                        node = this.SassVariable();
                        break;

                    case NUMBERSIGN:   // sass: #{ }
                        if (this.lookupType(1) === TYPE.LeftCurlyBracket) {
                            node = this.SassInterpolation(this.scope.Value, this.readSequence);
                        }
                        break;

                    case PERCENTAGESIGN:  // sass: 5 % 4
                        node = this.Operator();
                        break;
                }
                break;
        }

        // currently we can't validate values that contain less/sass extensions
        if (node !== null) {
            throw new PreprocessorExtensionError();
        }

        return originalGetNode.call(this, context);
    };

    return syntaxConfig;
};
