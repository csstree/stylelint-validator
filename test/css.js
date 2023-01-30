import validator from 'stylelint-csstree-validator';
import ruleTester from './utils/tester.js';

const { rule, ruleName, messages } = validator;
const css = ruleTester(rule, ruleName);
const unknownAtrule = (atrule, line, column) => {
    return invalid(messages.unknownAtrule(atrule), line, column);
};
const invalidPrelude = (atrule, line, column) => {
    return invalid(messages.invalidPrelude(atrule), line, column);
};
const unknownProperty = (atrule, line, column) => {
    return invalid(messages.unknownProperty(atrule), line, column);
};
const invalidValue = (prop, line, column) => {
    return invalid(messages.invalidValue(prop), line, column);
};
const invalid = (message, line, column) => {
    if (typeof line !== 'number' && typeof column !== 'number') {
        return message;
    }

    return { message, line, column };
};

// base test
css(null, function(tr) {
    tr.ok('.foo { color: red }');
    tr.ok('.foo { color: #123456 }');
    tr.ok('.foo { color: inherit }');
    tr.ok('.foo { color: initial }');
    tr.ok('.foo { color: unset }');
    tr.notOk('.foo { color: red green }', invalidValue('color'));
    tr.notOk('.foo { color: 1 }', invalidValue('color'));
    tr.notOk('.foo { color: #12345 }', invalidValue('color'));
    tr.notOk('.foo { color: &a }', messages.parseError('&a'));
    tr.notOk('.foo { baz: 123 }', unknownProperty('baz'));
    tr.notOk('@plugin "my-plugin"', unknownAtrule('plugin'));
    tr.notOk('@test;', unknownAtrule('test'));
    tr.notOk('.foo { color: @foo }', messages.parseError('@foo'));
});

// loc
css(null, function(tr) {
    tr.notOk('.foo { color: red green }', invalidValue('color', 1, 19));
    tr.notOk('.foo {\n  width: 10px;\n  color: red green;\n}', invalidValue('color', 3, 14));
});

// atrules
css(null, function(tr) {
    tr.notOk('  @unknown {}', unknownAtrule('unknown', 1, 3));
    tr.notOk('  @media ??? {}', invalidPrelude('media', 1, 10));
});
css({ ignoreAtrules: ['unknown', 'IMPORT'] }, function(tr) {
    tr.ok('  @UNKNOWN {}');
    tr.ok('  @import {}');
    tr.notOk('  @unknown-import {}', unknownAtrule('unknown-import', 1, 3));
    tr.notOk('  @media ??? {}', invalidPrelude('media', 1, 10));
});
css({ ignoreAtrules: ['unknown|import'] }, function(tr) {
    tr.ok('  @unknown {}');
    tr.ok('  @import {}');
    tr.notOk('  @unknown-import {}', unknownAtrule('unknown-import', 1, 3));
    tr.notOk('  @media ??? {}', invalidPrelude('media', 1, 10));
});
css({ ignoreAtrules: ['unknown', 'very-unknown|import'] }, function(tr) {
    tr.ok('  @unknown {}');
    tr.ok('  @very-unknown {}');
    tr.ok('  @import {}');
    tr.notOk('  @media ??? {}', invalidPrelude('media', 1, 10));
});
css({ atrules: false }, function(tr) {
    tr.ok('@unknown;');
    tr.ok('@media ??? {}');
});

// should ignore properties from `ignore` list
css({ ignoreProperties: ['foo', 'bar'] }, function(tr) {
    tr.ok('.foo { foo: 1 }');
    tr.ok('.foo { bar: 1 }');
    tr.notOk('.foo { foobar: 1 }', unknownProperty('foobar'));
    tr.ok('.foo { BAR: 1 }');
    tr.notOk('.foo { baz: 1 }', unknownProperty('baz'));
});
css({ ignoreProperties: ['foo|bar'] }, function(tr) {
    tr.ok('.foo { foo: 1 }');
    tr.ok('.foo { bar: 1 }');
    tr.notOk('.foo { foobar: 1 }', unknownProperty('foobar'));
    tr.ok('.foo { BAR: 1 }');
    tr.notOk('.foo { baz: 1 }', unknownProperty('baz'));
});
css({ ignoreProperties: ['/foo|bar/', '/qux/i'] }, function(tr) {
    tr.ok('.foo { foo: 1 }');
    tr.ok('.foo { bar: 1 }');
    tr.ok('.foo { foobar: 1 }');
    tr.notOk('.foo { BAR: 1 }', unknownProperty('BAR'));
    tr.ok('.foo { QUX: 1; qux: 2 }');
});
css({ ignoreProperties: [/foo|bar/, /qux/i] }, function(tr) {
    tr.ok('.foo { foo: 1 }');
    tr.ok('.foo { bar: 1 }');
    tr.ok('.foo { foobar: 1 }');
    tr.notOk('.foo { BAR: 1 }', unknownProperty('BAR'));
    tr.ok('.foo { QUX: 1; qux: 2 }');
});
css({ ignoreProperties: ['FOO', 'bar|QUX'] }, function(tr) {
    tr.ok('.foo { foo: 1 }');
    tr.ok('.foo { BAR: 1 }');
    tr.ok('.foo { qux: 1 }');
    tr.notOk('.foo { baz: 1 }', unknownProperty('baz'));
});
css({ ignoreProperties: ['token-\\d+'] }, function(tr) {
    tr.ok('.foo { token-1: 1 }');
    tr.ok('.foo { token-23: 1 }');
    tr.notOk('.foo { token-1-postfix: 1 }', unknownProperty('token-1-postfix'));
    tr.notOk('.foo { baz: 1 }', unknownProperty('baz'));
});

// should ignore by ignoreValue pattern
css({ ignoreValue: '^patternToIgnore$|=', ignoreProperties: ['bar'] }, function(tr) {
    tr.ok('.foo { color: red }');
    tr.ok('.foo { color: #fff }');
    tr.ok('.foo { color: patternToIgnore }');
    tr.ok('.foo { bar: notMatchingPattern }');
    tr.ok('.foo { color: alpha(opacity=1) }');
    tr.notOk('.foo { color: notMatchingPattern }', invalidValue('color'));
    tr.notOk('.foo { foo: patternToIgnore }', unknownProperty('foo', 1, 8));
    tr.notOk('.foo { foo: notMatchingPattern }', unknownProperty('foo'));
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
    tr.notOk('.baz { baz: my-fn(10px) }', unknownProperty('baz'));
    tr.ok('.qux { qux: 10px }');
    tr.notOk('.foo { color: my-fn(10px) }', invalidValue('color'));
    tr.ok('.foo { color: darken(white, 5%) }');
    tr.ok('.foo { color: white }');
    tr.notOk('.foo { color: darken(white, .05) }', invalidValue('color'));
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
    tr.notOk('.foo { composes: from "foo.css" }', invalidValue('composes', 1, 23));
    tr.notOk('.foo { composes: classNameA "foo.css" }', invalidValue('composes', 1, 29));
});

// atrule validation
css({
    ignoreValue: /ignore-this/,
    ignoreProperties: ['ignore-descriptor']
}, function(tr) {
    tr.ok('@import url("foo.css")');
    tr.ok('@import url("foo.css");');
    tr.ok('@imPOrt url("foo.css");');
    tr.ok('@font-face { font-display: swap }');
    tr.ok('@font-face { font-display: ignore-this }');
    tr.ok('@font-face { ignore-descriptor: foo }');
    tr.notOk('@font-face { font-display: ignore-that }', invalidValue('font-display', 1, 28));
    tr.notOk('.foo { font-display: swap }', invalid(`Unknown property \`font-display\` (${ruleName})`, 1, 8));
    tr.notOk('  @not-import url("foo.css");', unknownAtrule('not-import', 1, 3));
    // tr.notOk('  @-unknown-import url("foo.css");', unknownAtrule("-")known-mport`', 1, 3));
    tr.notOk('  @import { color: red }', invalid(`At-rule \`@import\` should contain a prelude (${ruleName})`, 1, 11));
    tr.notOk('  @import url("foo.css") .a', invalidPrelude('import', 1, 26));
    tr.notOk('  @font-face xx {}', invalid(`At-rule \`@font-face\` should not contain a prelude (${ruleName})`, 1, 14));
    tr.notOk('  @font-face { font-display: foo }', invalidValue('font-display', 1, 30));
    tr.notOk('  @font-face { font-displa: block }', invalid(`Unknown at-rule descriptor \`font-displa\` (${ruleName})`, 1, 16));
    tr.notOk('  @foo { color: ref }', [unknownAtrule('foo', 1, 3)]);
    tr.notOk('  @media zzz zzz { color: ref }', [invalidPrelude('media', 1, 14)]);
});

// options varnings
css({
    ignore: ['ignore-descriptor']
}, function(tr) {
    tr.notOk('a {}', `Invalid value "ignore-descriptor" for option "ignore" of rule "${ruleName}"`);
});
css({
    syntaxExtensions: ['sass', 'xxx']
}, function(tr) {
    tr.notOk('a {}', `Invalid value "xxx" for option "syntaxExtensions" of rule "${ruleName}"`);
});
