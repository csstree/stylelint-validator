import validator from 'stylelint-csstree-validator';
import lessSyntax from 'postcss-less';
import scssSyntax from 'postcss-scss';
import ruleTester from './utils/tester.js';

const { rule, ruleName, messages } = validator;
const less = ruleTester(rule, ruleName, {
    postcssOptions: { syntax: lessSyntax }
});
const sass = ruleTester(rule, ruleName, {
    postcssOptions: { syntax: scssSyntax }
});

const lessTests = function(tr) {
    // variables
    tr.ok('.foo { color: @var }');
    tr.ok('.foo { color: @@var }');
    tr.ok('.foo { color: @ }', messages.parseError('@'));
    tr.ok('.foo { color: @123 }', messages.parseError('@123'));
    tr.ok('.foo { color: @@@var }', messages.parseError('@@@var'));

    // escaping
    tr.ok('.foo { color: ~"test" }');
    tr.ok('.foo { color: ~\'test\' }');
    tr.notOk('.foo { color: ~ }', messages.parseError('~'));
    tr.notOk('.foo { color: ~123 }', messages.parseError('~123'));

    // interpolation
    tr.ok('.foo { @{property}: 1 }');
    tr.ok('.foo { test-@{property}: 1 }');
    tr.ok('.foo { @{property}-test: 1 }');

    // standalone var declarations
    tr.ok('@foo: 2');

    // namespaces
    tr.ok('.foo { color: #outer > .inner(); }');   // deprecated
    tr.ok('.foo { color: #outer> .inner(); }');    // deprecated
    tr.ok('.foo { color: #outer >.inner(); }');    // deprecated
    tr.ok('.foo { color: #outer>.inner(); }');     // deprecated
    tr.ok('.foo { color: #outer .inner(); }');     // deprecated
    tr.ok('.foo { color: #outer.inner(); }');      // preferred
    tr.ok('.foo { color: #outer.inner(1 + 2); }'); // preferred

    // custom at-rules
    // tr.ok('@plugin "my-plugin";');
};

const sassTests = function(tr) {
    // variables
    tr.ok('.foo { color: $red }');
    tr.ok('.foo { color: $ }', messages.parseError('$'));
    tr.ok('.foo { color: $123 }', messages.parseError('$123'));
    tr.ok('.foo { color: $$123 }', messages.parseError('$$123'));

    // modulo operator
    tr.ok('.foo { color: 3 % 6 }');

    // interpolation
    tr.ok('.foo { color: #{$var} }');
    tr.ok('.foo { color: #{1 + 2} }');
    tr.ok('.foo { max-height: calc(100vh - #{$navbar-height}); }');
    tr.ok('.foo { #{$property}: 1 }');
    tr.ok('.foo { test-#{$property}: 1 }');
    tr.ok('.foo { #{$property}-test: 1 }');

    // standalone var declarations
    tr.ok('$foo: 1');

    // namespace
    tr.ok('.foo { color: fonts.$font-family-text; }');
    tr.ok('.foo { color: fonts.foo(); }');
    tr.ok('.foo { color: fonts.foo(1 + 2); }');
};

// less extenstions
less({ syntaxExtensions: ['less'] }, lessTests);
less({ syntaxExtensions: ['less', 'sass'] }, lessTests);

// sass extenstions
sass({ syntaxExtensions: ['sass'] }, sassTests);
sass({ syntaxExtensions: ['sass', 'less'] }, sassTests);
