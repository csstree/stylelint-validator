import { tokenTypes as TYPE } from 'css-tree';
import * as SassVariable from './SassVariable.js';
import * as SassInterpolation from './SassInterpolation.js';
import * as SassNamespace from './SassNamespace.js';

const NUMBERSIGN = 0x0023;      // U+0023 NUMBER SIGN (#)
const DOLLARSIGN = 0x0024;      // U+0024 DOLLAR SIGN ($)
const PERCENTAGESIGN = 0x0025;  // U+0025 PERCENTAGE SIGN (%)
const FULLSTOP = 0x002E;        // U+002E FULL STOP (.)

// custom error
class PreprocessorExtensionError {
    constructor() {
        this.type = 'PreprocessorExtensionError';
    }
}

function throwOnSyntaxExtension() {
    let node = null;

    switch (this.tokenType) {
        case TYPE.Ident:
            if (this.isDelim(FULLSTOP, 1)) {
                node = this.SassNamespace();
            }
            break;

        case TYPE.Delim:
            switch (this.source.charCodeAt(this.tokenStart)) {
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
}

export default function sass(syntaxConfig) {
    // new node types
    syntaxConfig.node.SassVariable = SassVariable;
    syntaxConfig.node.SassInterpolation = SassInterpolation;
    syntaxConfig.node.SassNamespace = SassNamespace;

    // custom at-rules
    syntaxConfig.atrules['at-root'] = {
        prelude: '<any-value>'
    };
    syntaxConfig.atrules.content = {
        prelude: '<any-value>'
    };
    syntaxConfig.atrules.debug = {
        prelude: '<any-value>'
    };
    syntaxConfig.atrules.each = {
        prelude: '<any-value>'
    };
    syntaxConfig.atrules.else = {
        prelude: '<any-value>?'
    };
    syntaxConfig.atrules.error = {
        prelude: '<any-value>'
    };
    syntaxConfig.atrules.extend = {
        prelude: '<any-value>'
    };
    syntaxConfig.atrules.for = {
        prelude: '<any-value>'
    };
    syntaxConfig.atrules.forward = {
        prelude: '<any-value>'
    };
    syntaxConfig.atrules.function = {
        prelude: '<any-value>'
    };
    syntaxConfig.atrules.if = {
        prelude: '<any-value>'
    };
    syntaxConfig.atrules.import = {
        prelude: syntaxConfig.atrules.import.prelude + '| <string>#' // FIXME: fix prelude extension in css-tree
    };
    syntaxConfig.atrules.include = {
        prelude: '<any-value>'
    };
    syntaxConfig.atrules.mixin = {
        prelude: '<any-value>'
    };
    syntaxConfig.atrules.return = {
        prelude: '<any-value>'
    };
    syntaxConfig.atrules.use = {
        prelude: '<any-value>'
    };
    syntaxConfig.atrules.warn = {
        prelude: '<any-value>'
    };
    syntaxConfig.atrules.while = {
        prelude: '<any-value>'
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
};
