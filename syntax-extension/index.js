var TYPE = require('css-tree').Tokenizer.TYPE;

// custom 
var PreprocessorExtensionError = function() {
    this.type = 'PreprocessorExtensionError';
};

module.exports = function extendParser(syntaxConfig) {
    // new node types
    syntaxConfig.node.LessVariableReference = require('./less/LessVariableReference');
    syntaxConfig.node.LessVariable = require('./less/LessVariable');
    syntaxConfig.node.LessEscaping = require('./less/LessEscaping');
    syntaxConfig.node.SassVariable = require('./sass/SassVariable');
    syntaxConfig.node.SassInterpolation = require('./sass/SassInterpolation');

    // extend parser value parser
    var originalGetNode = syntaxConfig.scope.Value.getNode;
    syntaxConfig.scope.Value.getNode = function(context) {
        var node = null;

        switch (this.scanner.tokenType) {
            // less
            case TYPE.CommercialAt: // @@var
                if (this.scanner.lookupType(1) === TYPE.Atrule) {
                    node = this.LessVariableReference();
                }
                break;

            case TYPE.Atrule:       // @var
                node = this.LessVariable();
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
                    node = this.SassInterpolation(this.scope.Value, this.readSequence);
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

        return originalGetNode.call(this, context);
    };

    return syntaxConfig;
};
