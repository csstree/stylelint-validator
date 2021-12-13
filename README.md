[![NPM version](https://img.shields.io/npm/v/stylelint-csstree-validator.svg)](https://www.npmjs.com/package/stylelint-csstree-validator)
[![Build Status](https://github.com/csstree/stylelint-validator/actions/workflows/build.yml/badge.svg)](https://github.com/csstree/stylelint-validator/actions/workflows/build.yml)
[![Coverage Status](https://coveralls.io/repos/github/csstree/stylelint-validator/badge.svg?branch=master)](https://coveralls.io/github/csstree/stylelint-validator?branch=master)

# stylelint-csstree-validator

A [stylelint](http://stylelint.io/) plugin based on [csstree](https://github.com/csstree/csstree) to examinate CSS syntax. It examinates at-rules and declaration values to match W3C specs and browsers extensions. It might be extended in future to validate other parts of CSS.

> ⚠️ Warning ⚠️: The plugin is designed to validate CSS syntax only. However `stylelint` may be configured to use for other syntaxes like Less or Sass. In this case, the plugin avoids examination of expressions containing non-standard syntax.

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

- [atrules](#atrules)
- [properties](#properties)
- [types](#types)
- [ignore](#ignore)
- [ignoreProperties](#ignoreproperties)
- [ignoreValue](#ignorevalue)

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

#### ignoreProperties

Type: `Array` or `false`  
Default: `false`

Defines a list of property names that should be ignored by the plugin.

```json
{
  "plugins": [
    "stylelint-csstree-validator"
  ],
  "rules": {
    "csstree/validator": {
      "ignoreProperties": ["composes", "foo", "bar"]
    }
  }
}
```

In this example, plugin will not test declarations with a property name `composes`, `foo` or `bar`, i.e. no warnings for these declarations would be raised.

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

## License

MIT
