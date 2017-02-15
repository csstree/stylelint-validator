var TYPE = require('css-tree').Tokenizer.TYPE;

// custom 
var PreprocessorExtensionError = function() {
    this.type = 'PreprocessorExtensionError';
};

module.exports = function extendParser(parser) {
    // new node types
    parser.LessVariableReference = require('./less/LessVariableReference');
    parser.LessVariable = require('./less/LessVariable');
    parser.LessEscaping = require('./less/LessEscaping');
    parser.SassVariable = require('./sass/SassVariable');
    parser.SassInterpolation = require('./sass/SassInterpolation');
    
    // patch HexColor, since we need check before default
    // TODO: remove after parser extension improvement
    var originalHexColor = parser.HexColor;
    parser.HexColor = function() {
        if (this.scanner.tokenType === TYPE.NumberSign &&
            this.scanner.lookupType(1) === TYPE.LeftCurlyBracket) {
            this.SassInterpolation(this.readSequence);
            throw new PreprocessorExtensionError();
        }

        return originalHexColor.call(this);
    };

    // extend parser value parser
    parser.readSequenceFallback = function() {
        var node = null;

        switch (this.scanner.tokenType) {
            // less
            case TYPE.CommercialAt: // @var | @@var
                node = this.scanner.lookupType(1) === TYPE.CommercialAt
                    ? this.LessVariableReference()  // @@var
                    : this.LessVariable();          // @var
                break;

            case TYPE.Tilde:        // ~"asd" | ~'asd'
                node = this.LessEscaping();
                break;

            // sass
            case TYPE.DollarSign:   // $var
                node = this.SassVariable();
                break;

            case TYPE.NumberSign:   // #{ }
                if (this.scanner.lookupType(1) === TYPE.LeftCurlyBracket) {
                    node = this.SassInterpolation(this.readSequence);
                }
                break;

            case TYPE.PercentSign:  // 5 % 4
                node = this.Operator();
                break;
        }

        // currently we can't validate values that contain less/sass extensions
        if (node !== null) {
            throw new PreprocessorExtensionError();
        }
    };

    return parser;
};
