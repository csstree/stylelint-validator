var ruleTester = require('stylelint-rule-tester');
var validator = require('..');
var messages = validator.messages;
var css = ruleTester(validator.rule, validator.ruleName);
var less = ruleTester(validator.rule, validator.ruleName, {
    postcssOptions: { syntax: require('postcss-less') }
});
var sass = ruleTester(validator.rule, validator.ruleName, {
    postcssOptions: { syntax: require('postcss-scss') }
});

// base test
css(null, function(tr) {
    tr.ok('.foo { color: red }');
    tr.ok('.foo { color: #123456 }');
    tr.notOk('.foo { color: red green }', messages.uncomplete('color'));
    tr.notOk('.foo { color: 1 }', messages.invalid('color'));
    tr.notOk('.foo { color: #12345 }', messages.invalid('color'));
    tr.notOk('.foo { color: &a }', messages.parseError('&a'));
    tr.notOk('.foo { baz: 123 }', 'Unknown property: baz');
});

// ignore values with less extenstions
less(null, function(tr) {
    // variables
    tr.ok('.foo { color: @var }');
    // tr.ok('.foo { color: @@var }');
    tr.notOk('.foo { color: @ }', messages.parseError('@'));
    tr.notOk('.foo { color: @123 }', messages.parseError('@123'));
    tr.notOk('.foo { color: @@@var }', messages.parseError('@@@var'));

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
});

// ignore values with sass extenstions
sass(null, function(tr) {
    // variables
    tr.ok('.foo { color: $red }');
    tr.notOk('.foo { color: $ }', messages.parseError('$'));
    tr.notOk('.foo { color: $123 }', messages.parseError('$123'));
    tr.notOk('.foo { color: $$123 }', messages.parseError('$$123'));

    // modulo operator
    tr.ok('.foo { color: 3 % 6 }');

    // interpolation
    tr.ok('.foo { color: #{$var} }');
    tr.ok('.foo { color: #{1 + 2} }');
    tr.ok('.foo { #{$property}: 1 }');
    tr.ok('.foo { test-#{$property}: 1 }');
    tr.ok('.foo { #{$property}-test: 1 }');

    // standalone var declarations
    tr.ok('$foo: 1');
});

// should ignore properties from `ignore` list
css({ ignore: ['foo', 'bar'] }, function(tr) {
    tr.ok('.foo { foo: 1 }');
    tr.ok('.foo { bar: 1 }');
    tr.ok('.foo { BAR: 1 }');
    tr.notOk('.foo { baz: 1 }', 'Unknown property: baz');
});
