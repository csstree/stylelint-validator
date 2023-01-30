[![NPM version](https://img.shields.io/npm/v/stylelint-csstree-validator.svg)](https://www.npmjs.com/package/stylelint-csstree-validator)
[![Build Status](https://github.com/csstree/stylelint-validator/actions/workflows/build.yml/badge.svg)](https://github.com/csstree/stylelint-validator/actions/workflows/build.yml)
[![Coverage Status](https://coveralls.io/repos/github/csstree/stylelint-validator/badge.svg?branch=master)](https://coveralls.io/github/csstree/stylelint-validator?branch=master)

# stylelint-csstree-validator

A [stylelint](http://stylelint.io/) plugin based on [csstree](https://github.com/csstree/csstree) to examinate CSS syntax. It examinates at-rules and declaration values to match W3C specs and browsers extensions. It might be extended in future to validate other parts of CSS.

> ⚠️ Warning ⚠️: The plugin is designed to validate CSS syntax only. However `stylelint` may be configured to use for other syntaxes like Less or Sass. In this case, the plugin avoids examination of expressions containing non-standard syntax, but you need specify which preprocessor is used with the [`syntaxExtensions`](#syntaxextensions) option.

## Install

```
$ npm install --save-dev stylelint-csstree-validator
```

## Usage

Setup plugin in [stylelint config](http://stylelint.io/user-guide/configuration/):

```json
{
  "plugins": [
    "stylelint-csstree-validator"
  ],
  "rules": {
    "csstree/validator": true
  }
}
```

### Options

- [syntaxExtensions](#syntaxextensions)
- [atrules](#atrules)
- [properties](#properties)
- [types](#types)
- [ignore](#ignore) (deprecated)
- [ignoreAtrules](#ignoreatrules)
- [ignoreProperties](#ignoreproperties)
- [ignoreValue](#ignorevalue)

#### syntaxExtensions

Type: `Array<'sass' | 'less'>` or `false`  
Default: `false`

Since the plugin focuses on CSS syntax validation it warns on a syntax which is introducing by preprocessors like Less or Sass. The `syntaxExtensions` option allows to specify that some preprocessor's syntaxes are used for styles so the plugin may avoid warnings when met such a syntax.

By default the plugin exams styles as pure CSS. To specify that a preprocessor's syntax is used, you must specify an array with the names of these extensions. Currently supported:

- `sass` – declaration values with Sass syntax will be ignored as well as custom at-rules introduced by Saas (e.g. `@if`, `@else`, `@mixin` etc). For now Sass at-rules are allowed with any prelude, but it might be replaced for real syntax definitions in future releases
- `less` – declaration values with Sass syntax will be ignored as well as `@plugin` at-rule introduced by Less

Using both syntax extensions is also possible:

```json
{
  "plugins": [
    "stylelint-csstree-validator"
  ],
  "rules": {
    "csstree/validator": {
      "syntaxExtensions": ["sass", "less"]
    }
  }
}
```

#### atrules

Type: `Object`, `false` or `null`  
Default: `null`

Using `false` value for the option disables at-rule validation.

Otherwise the option is using for extending or altering at-rules syntax dictionary. An atrule definition consists of `prelude` and `descriptors`, both are optional. A `prelude` is a single expression that comes after at-rule name. A `descriptors` is a dictionary like [`properties`](#properties) option but for a specific at-rule. [CSS Value Definition Syntax](https://github.com/csstree/csstree/blob/master/docs/definition-syntax.md) is used to define value's syntax. If a definition starts with `|` it is adding to existing definition value if any. See [CSS syntax reference](https://csstree.github.io/docs/syntax/) for default definitions.

The following example defines new atrule `@example` with a prelude and two descriptors (a descriptor is the same as a declaration but with no `!important` allowed):

```json
{
  "plugins": [
    "stylelint-csstree-validator"
  ],
  "rules": {
    "csstree/validator": {
      "atrules": {
        "example": {
          "prelude": "<custom-ident>",
          "descriptors": {
            "foo": "<number>",
            "bar": "<color>"
          }
        }
      }
    }
  }
}
```

#### properties

Type: `Object` or `null`  
Default: `null`

An option for extending or altering properties syntax dictionary. [CSS Value Definition Syntax](https://github.com/csstree/csstree/blob/master/docs/definition-syntax.md) is used to define value's syntax. If a definition starts with `|` it is adding to existing definition value if any. See [CSS syntax reference](https://csstree.github.io/docs/syntax/) for default definitions.

The following example extends `width` and defines `size` properties:

```json
{
  "plugins": [
    "stylelint-csstree-validator"
  ],
  "rules": {
    "csstree/validator": {
      "properties": {
        "width": "| new-keyword | custom-function(<length>, <percentage>)",
        "size": "<length-percentage>"
      }
    }
  }
}
```

Using `<any-value>` for a property definition is an alternative for `ignoreProperties` option.

```json
{
  "plugins": [
    "stylelint-csstree-validator"
  ],
  "rules": {
    "csstree/validator": {
      "properties": {
        "my-custom-property": "<any-value>"
      }
    }
  }
}
```

#### types

Type: `Object` or `null`  
Default: `null`

An option for extending or altering types syntax dictionary. Types are something like a preset which allow reuse a definition across other definitions. [CSS Value Definition Syntax](https://github.com/csstree/csstree/blob/master/docs/definition-syntax.md) is used to define value's syntax. If a definition starts with `|` it is adding to existing definition value if any. See [CSS syntax reference](https://csstree.github.io/docs/syntax/) for default definitions.

The following example defines a new functional type `my-fn()` and extends `color` type:

```json
{
  "plugins": [
    "stylelint-csstree-validator"
  ],
  "rules": {
    "csstree/validator": {
      "properties": {
        "some-property": "<my-fn()>"
      },
      "types": {
        "color": "| darken(<color>, [ <percentage> | <number [0, 1]> ])",
        "my-fn()": "my-fn( <length-percentage> )"
      }
    }
  }
}
```

#### ignore

Works the same as [`ignoreProperties`](#ignoreproperties) but **deprecated**, use `ignoreProperties` instead.

#### ignoreAtrules

Type: `Array<string|RegExp>` or `false`  
Default: `false`

Defines a list of at-rules names that should be ignored by the plugin. Ignorance for an at-rule means no validation for its name, prelude or descriptors. The names provided are used for full case-insensitive matching, i.e. a vendor prefix is mandatory and prefixed names should be provided as well if you need to ignore them. You can use [RegExp patterns](#regexp-patterns) in the list as well.

```json
{
  "plugins": [
    "stylelint-csstree-validator"
  ],
  "rules": {
    "csstree/validator": {
      "ignoreAtrules": ["custom-at-rule", "-webkit-keyframes"]
    }
  }
}
```

#### ignoreProperties

Type: `Array<string|RegExp>` or `false`  
Default: `false`

Defines a list of property names that should be ignored by the plugin. The names provided are used for full case-insensitive matching, i.e. a vendor prefix is mandatory and prefixed names should be provided as well if you need to ignore them.

```json
{
  "plugins": [
    "stylelint-csstree-validator"
  ],
  "rules": {
    "csstree/validator": {
      "ignoreProperties": ["composes", "mask", "-webkit-mask"]
    }
  }
}
```

In this example, plugin will not test declarations with a property name `composes`, `mask` or `-webkit-mask`, i.e. no warnings for these declarations would be raised. You can use [RegExp patterns](#regexp-patterns) in the list as well.

#### ignoreValue

Type: `RegExp` or `false`  
Default: `false`

Defines a pattern for values that should be ignored by the validator.

```json
{
  "plugins": [
    "stylelint-csstree-validator"
  ],
  "rules": {
    "csstree/validator": {
      "ignoreValue": "^pattern$"
    }
  }
}
```

For this example, the plugin will not report warnings for values which is matched the given pattern. However, warnings will still be reported for unknown properties.

## RegExp patterns

In some cases a more general match patterns are needed instead of exact name matching. In such cases a RegExp pattern can be used. 

Since CSS names are an indentifiers which can't contain a special characters used for RegExp's, a distinguishing between a CSS name and RegExp is a trivial problem. When the plugin encounters a string in a ignore pattern list containing any character other than `a-z`, `A-Z`, `0-9` or `-`, it produces a RegExp using the construction `new RegExp('^(' + pattern + ')$', 'i')`. In other words, the pattern should be fully matched case-insensitive.

To have a full control over a RegExp pattern, a regular RegExp instance or its stringified version (i.e. `"/pattern/flags?"`) can be used.

- `"foo|bar"` transforms into `/^(foo|bar)$/i`
- `"/foo|bar/i"` transforms into `/foo|bar/i` (note: it's not the same as previous RegExp, since not requires a full match with a name)
- `/foo|bar/` used as is (note: with no `i` flag a matching will be case-sensitive which makes no sense in CSS)

## License

MIT
