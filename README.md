[![NPM version](https://img.shields.io/npm/v/stylelint-csstree-validator.svg)](https://www.npmjs.com/package/stylelint-csstree-validator)

# csstree-validator

CSS syntax validator based on [csstree](https://github.com/csstree/csstree) as plugin for [stylelint](http://stylelint.io/). Currently it's only checking declaration values to match W3C specs and browsers extensions.

## Install

```
$ npm install --save-dev stylelint-csstree-validator
```

## Usage

In your [stylelint config](http://stylelint.io/user-guide/configuration/) add this.

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
