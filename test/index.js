var ruleTester = require('stylelint-rule-tester');
var validator = require('..');
var messages = validator.messages;
var testRule = ruleTester(validator.rule, validator.ruleName);

// base test
testRule(null, function(tr) {
    tr.ok('.foo { color: red }');
    tr.notOk('.foo { color: red green }', messages.uncomplete('color'));
    tr.notOk('.foo { color: 1 }', messages.invalid('color'));
    tr.notOk('.foo { color: #12345 }', messages.invalid('color'));
    tr.notOk('.foo { color: &a }', messages.parseError('&a'));
});

// ignore values with preprocessor extenstions
testRule(null, function(tr) {
    // less
    tr.ok('.foo { color: @red }');
    tr.ok('.foo { color: ~"test" }');
    // sass/scss
    tr.ok('.foo { color: $red }');
    tr.ok('.foo { color: 3 % 6 }');
});

// should ignore preprocessor var declaration
testRule({ ignore: ['foo', 'bar'] }, function(tr) {
    tr.ok('$foo: 1');
    tr.ok('@foo: 2');
});

// should ignore properties from `ignore` list
testRule({ ignore: ['foo', 'bar'] }, function(tr) {
    tr.ok('.foo { foo: 1 }');
    tr.ok('.foo { bar: 1 }');
    tr.ok('.foo { BAR: 1 }');
    tr.notOk('.foo { baz: 1 }', 'Unknown property: baz');
});
