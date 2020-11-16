const ruleTester = require('stylelint-rule-tester');
const validator = require('..');
const messages = validator.messages;
const css = ruleTester(validator.rule, validator.ruleName);
const less = ruleTester(validator.rule, validator.ruleName, {
    postcssOptions: { syntax: require('postcss-less') }
});
const sass = ruleTester(validator.rule, validator.ruleName, {
    postcssOptions: { syntax: require('postcss-scss') }
});
const invalid = (prop, line, column) => {
    const message = messages.invalid(prop);

    if (typeof line !== 'number' && typeof column !== 'number') {
        return message;
    }

    return { message, line, column };
}

// base test
css(null, function(tr) {
    tr.ok('.foo { color: red }');
    tr.ok('.foo { color: #123456 }');
    tr.notOk('.foo { color: red green }', invalid('color'));
    tr.notOk('.foo { color: 1 }', invalid('color'));
    tr.notOk('.foo { color: #12345 }', invalid('color'));
    tr.notOk('.foo { color: &a }', messages.parseError('&a'));
    tr.notOk('.foo { baz: 123 }', 'Unknown property `baz`');
});

// loc
css(null, function(tr) {
    tr.notOk('.foo { color: red green }', invalid('color', 1, 19));
    tr.notOk('.foo {\n  width: 10px;\n  color: red green;\n}', invalid('color', 3, 14));
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
    tr.ok('.foo { max-height: calc(100vh - #{$navbar-height}); }');
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
    tr.notOk('.foo { baz: 1 }', 'Unknown property `baz`');
});

// should ignore by ignoreValue pattern
css({ ignoreValue: "^patternToIgnore$", ignore: ['bar'] }, function(tr) {
    tr.ok('.foo { color: red }');
    tr.ok('.foo { color: #fff }');
    tr.ok('.foo { color: patternToIgnore }');
    tr.ok('.foo { bar: notMatchingPattern }');
    tr.notOk('.foo { color: notMatchingPattern }', invalid('color'));
    tr.notOk('.foo { foo: patternToIgnore }', 'Unknown property `foo`');
    tr.notOk('.foo { foo: notMatchingPattern }', 'Unknown property `foo`');
});

// extend dictionary
css({
    properties: {
        foo: '<my-fn()>',
        bar: '| <my-fn()>',
        qux: '<qux>',
        relax: '<any-value>'
    },
    types: {
        'my-fn()': 'my-fn(<length-percentage>)',
        qux: '| <length>',
        color: '| darken(<color>, <percentage>)'
    }
}, function(tr) {
    tr.ok('.foo { foo: my-fn(10px) }');
    tr.ok('.foo { foo: my-fn(10%) }');
    tr.ok('.foo { foo: my-fn(0) }');
    tr.ok('.bar { bar: my-fn(10px) }');
    tr.notOk('.baz { baz: my-fn(10px) }', 'Unknown property `baz`');
    tr.ok('.qux { qux: 10px }');
    tr.notOk('.foo { color: my-fn(10px) }', invalid('color'));
    tr.ok('.foo { color: darken(white, 5%) }');
    tr.ok('.foo { color: white }');
    tr.notOk('.foo { color: darken(white, .05) }', invalid('color'));
    tr.ok('.foo { relax: white }');
    tr.ok('.foo { relax: 10px solid whatever }');
});

css({
    properties: {
        composes: '<custom-ident>+ [ from [ <string> | global ] ]?'
    }
}, function(tr) {
    tr.ok('.foo { composes: className }');
    tr.ok('.foo { composes: classNameA classNameB }');
    tr.ok('.foo { composes: classNameA from "foo.css" }');
    tr.ok('.foo { composes: classNameA from global }');
    tr.ok('.foo { composes: classNameA classNameB from "foo.css" }');
    tr.notOk('.foo { composes: from "foo.css" }', invalid('composes', 1, 23));
    tr.notOk('.foo { composes: classNameA "foo.css" }', invalid('composes', 1, 29));
});
