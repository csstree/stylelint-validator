var tokenize = require('css-tree').tokenize;
var TYPE = tokenize.TYPE;
var CHARCODE = tokenize.CHARCODE;

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
            case TYPE.AtKeyword:    // less: @var
                node = this.LessVariable();
                break;
            
            case TYPE.Delim:
                switch (this.scanner.source.charCodeAt(this.scanner.tokenStart)) {
                    case CHARCODE.CommercialAt: // less: @@var
                        if (this.scanner.lookupType(1) === TYPE.Atrule) {
                            node = this.LessVariableReference();
                        }
                        break;
        
                    case CHARCODE.Tilde:        // less: ~"asd" | ~'asd'
                        node = this.LessEscaping();
                        break;

                    case CHARCODE.DollarSign:   // sass: $var
                        node = this.SassVariable();
                        break;
        
                    case CHARCODE.NumberSign:   // sass: #{ }
                        if (this.scanner.lookupType(1) === TYPE.LeftCurlyBracket) {
                            node = this.SassInterpolation(this.scope.Value, this.readSequence);
                        }
                        break;
        
                    case CHARCODE.PercentSign:  // sass: 5 % 4
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
