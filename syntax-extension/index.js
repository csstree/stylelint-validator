var TYPE = require('css-tree').Tokenizer.TYPE;

// custom 
var PreprocessorExtensionError = function() {
    this.type = 'PreprocessorExtensionError';
};

module.exports = function extendParser(parser) {
    // extend parser value parser
    parser.LessVariableReference = require('./less/LessVariableReference');
    parser.LessVariable = require('./less/LessVariable');
    parser.LessEscaping = require('./less/LessEscaping');
    parser.SassVariable = require('./sass/SassVariable');
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
