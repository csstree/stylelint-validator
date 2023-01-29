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

    // at-rule with Less expressions in a prelude
    tr.ok('@keyframes @name {}');
    tr.notOk('@keyframes "foo" "bar" {}', messages.invalidPrelude('keyframes'));

    // custom at-rules
    tr.ok('@plugin "my-plugin";');
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

    // at-rule with Sass expressions in a prelude
    tr.ok('@media ($from: $breakpoint) {}');
    tr.notOk('@media (123) {}', messages.invalidPrelude('media'));
    tr.ok('@keyframes #{$animationName} {}');
    tr.notOk('@keyframes "foo" "bar" {}', messages.invalidPrelude('keyframes'));

    // custom at-rules
    tr.ok('@at-root xxx');
    tr.ok('@content xxx');
    tr.ok('@debug xxx');
    tr.ok('@each xxx');
    tr.ok('@error xxx');
    tr.ok('@extend xxx');
    tr.ok('@for xxx');
    tr.ok('@forward xxx');
    tr.ok('@function xxx');
    tr.ok('@if xxx');
    tr.ok('@else xxx');
    tr.ok('@else {}');
    tr.ok('@else if {}');
    tr.ok('@import "theme.css";');
    tr.ok('@import "http://fonts.googleapis.com/css?family=Droid+Sans";');
    tr.ok('@import url(theme);');
    tr.ok('@import "landscape" screen and (orientation: landscape);');
    tr.ok('@include xxx');
    tr.ok('@mixin xxx');
    tr.ok('@return xxx');
    tr.ok('@use xxx');
    tr.ok('@warn xxx');
    tr.ok('@while xxx');
};

// less extenstions
less({ syntaxExtensions: ['less'] }, (tr) => {
    lessTests(tr);

    // custom Sass at-rules
    tr.notOk('@if $test {}', messages.unknownAtrule('if'));
});
less({ syntaxExtensions: ['less', 'sass'] }, lessTests);

// sass extenstions
sass({ syntaxExtensions: ['sass'] }, (tr) => {
    sassTests(tr);

    // custom Sass at-rules
    tr.notOk('@plugin "foo";', messages.unknownAtrule('plugin'));
});
sass({ syntaxExtensions: ['sass', 'less'] }, sassTests);
