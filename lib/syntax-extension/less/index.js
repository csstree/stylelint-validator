import { tokenTypes as TYPE } from 'css-tree';
import * as LessVariableReference from './LessVariableReference.js';
import * as LessVariable from './LessVariable.js';
import * as LessEscaping from './LessEscaping.js';
import * as LessNamespace from './LessNamespace.js';

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

function throwOnSyntaxExtension() {
    let node = null;

    switch (this.tokenType) {
        case TYPE.AtKeyword:    // less: @var
            node = this.LessVariable();
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


            }

            break;
    }

    // currently we can't validate values that contain less/sass extensions
    if (node !== null) {
        throw new PreprocessorExtensionError();
    }
}

export default function less(syntaxConfig) {
    // new node types
    syntaxConfig.node.LessVariableReference = LessVariableReference;
    syntaxConfig.node.LessVariable = LessVariable;
    syntaxConfig.node.LessEscaping = LessEscaping;
    syntaxConfig.node.LessNamespace = LessNamespace;

    // custom at-rules
    syntaxConfig.atrules.plugin = {
        prelude: '<string>'
    };

    // extend parser's at-rule preluder parser
    const originalAttrulePreludeGetNode = syntaxConfig.scope.AtrulePrelude.getNode;
    syntaxConfig.scope.AtrulePrelude.getNode = function(context) {
        throwOnSyntaxExtension.call(this);

        return originalAttrulePreludeGetNode.call(this, context);
    };

    // extend parser's value parser
    const originalValueGetNode = syntaxConfig.scope.Value.getNode;
    syntaxConfig.scope.Value.getNode = function(context) {
        throwOnSyntaxExtension.call(this);

        return originalValueGetNode.call(this, context);
    };

    return syntaxConfig;
}
