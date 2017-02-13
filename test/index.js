var ruleTester = require('stylelint-rule-tester');
var validator = require('..');
var messages = validator.messages;
var testRule = ruleTester(validator.rule, validator.ruleName);

testRule('base test', function(tr) {
    tr.ok('.foo { color: red }');
    tr.notOk('.foo { color: red green }', messages.uncomplete('color'));
    tr.notOk('.foo { color: 1 }', messages.invalid('color'));
    tr.notOk('.foo { color: #12345 }', messages.invalid('color'));
    tr.notOk('.foo { color: &a }', messages.parseError('&a'));
});
