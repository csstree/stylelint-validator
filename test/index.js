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

// ignore values with less extenstions
testRule(null, function(tr) {
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

    tr.ok('@foo: 2');
});

// ignore values with sass extenstions
testRule(null, function(tr) {
    tr.ok('.foo { color: $red }');
    tr.notOk('.foo { color: $ }', messages.parseError('$'));
    tr.notOk('.foo { color: $123 }', messages.parseError('$123'));
    tr.notOk('.foo { color: $$123 }', messages.parseError('$$123'));

    tr.ok('.foo { color: 3 % 6 }');

    tr.ok('$foo: 1');
});

// should ignore properties from `ignore` list
testRule({ ignore: ['foo', 'bar'] }, function(tr) {
    tr.ok('.foo { foo: 1 }');
    tr.ok('.foo { bar: 1 }');
    tr.ok('.foo { BAR: 1 }');
    tr.notOk('.foo { baz: 1 }', 'Unknown property: baz');
});
