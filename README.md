[![NPM version](https://img.shields.io/npm/v/stylelint-csstree-validator.svg)](https://www.npmjs.com/package/stylelint-csstree-validator)

# stylelint-csstree-validator

CSS syntax validator based on [csstree](https://github.com/csstree/csstree) as plugin for [stylelint](http://stylelint.io/). Currently it's only checking declaration values to match W3C specs and browsers extensions. It would be extended in future to validate other parts of CSS.

## Install

```
$ npm install --save-dev stylelint-csstree-validator
```

## Usage

Setup plugin in your [stylelint config](http://stylelint.io/user-guide/configuration/):

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

## License

MIT
