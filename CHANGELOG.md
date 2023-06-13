## 3.0.0 (June 12, 2023)

- Added support for stylelint 15 (#53)
- Dropped support for Node.js below 14.13

## 2.1.0 (January 29, 2023)

- Bumped `css-tree` to `^2.3.1`
- Extended `ignoreAtrules` and `ignoreProperties` options to accept [RegExp patterns](README.md#regexp-patterns) (#19, #45)
- Fixed Sass's `@else` at-rule to allow have no a prelude (#46)
- Changed at-rule prelude validation to emit no warnings when a prelude contains Sass/Less syntax extensions (#44)

## 2.0.0 (December 14, 2021)

- Added `syntaxExtensions` option to specify syntax extensions, i.e. `sass` or/and `less`. For now **the plugin validates CSS only by default**
- Added at-rule validation for name, prelude and descriptors
- Added `atrules` option to extend or alter at-rule syntax definition dictionary or disable at-rule validation when `false` is passed as a value for the option
- Added `ignoreAtrules` option to specify at-rule names which should not be validated
- Used `isStandardSyntax*()` helpers from `stylelint` to reduce failures for non-standard syntax (e.g. Less or Sass)
- Added support for Less & Sass namespaces, a value with such constructions are ignored now instead of failure (#39)
- Added a column to mismatch error details
- Renamed `ignore` option into `ignoreProperties` to be more clear what is ignoring; `ignore` option is still work but cause to a deprecation warning
- Fixed `ignoreValue` option to apply for parse errors either (#43)
- Fixed failure on a declaration with a Less variable reference, i.e. ignore such declarations for now
- Package
    - Changed supported versions of Node.js to `^12.20.0`, `^14.13.0` and `>=15.0.0`
    - Converted to ES modules. However, CommonJS is supported as well (dual module)
    - Bumped `css-tree` to [`2.0`](https://github.com/csstree/csstree/releases/tag/v2.0.0) and latest `mdn-data` dictionaries

## 1.9.0 (October 27, 2020)

- Bumped CSSTree to `^1.0.0` (mdn-data is bumped to `2.0.12`)
- Added `properties` and `types` options to extend syntax dictionary
- Added `ignoreValue` option (#14)

## 1.8.0 (January 24, 2020)

- Added support for stylelint 13 (#25, thanks to @limonte)

## 1.7.0 (November 25, 2019)

- Added support for stylelint 12 (#24, #23, thanks to @limonte & @gforcada)
- Bumped CSSTree to `1.0.0-alpha.38` (mdn-data is bumped to `2.0.6`)

## 1.6.1 (October 6, 2019)

- Fixed regression after CSSTree bump to 1.0.0-alpha.34

## 1.6.0 (October 6, 2019)

- Added support for stylelint 11 (#21, thanks to @ntwb)
- Bumped CSSTree to [1.0.0-alpha.34](https://github.com/csstree/csstree/releases/tag/v1.0.0-alpha.34)

## 1.5.2 (July 11, 2019)

- Bumped CSSTree to [1.0.0-alpha.33](https://github.com/csstree/csstree/releases/tag/v1.0.0-alpha.33)

## 1.5.1 (July 11, 2019)

- Bumped CSSTree to [1.0.0-alpha.32](https://github.com/csstree/csstree/releases/tag/v1.0.0-alpha.32)

## 1.5.0 (July 11, 2019)

- Bumped CSSTree to [1.0.0-alpha.31](https://github.com/csstree/csstree/releases/tag/v1.0.0-alpha.31)

## 1.4.1 (July 5, 2019)

- Fixed missed `console.log()` (#18)

## 1.4.0 (July 3, 2019)

- Added support for stylelint 10 (#17, thanks to @limonte)
- Bumped CSSTree to [1.0.0-alpha.30](https://github.com/csstree/csstree/releases/tag/v1.0.0-alpha.30)

## 1.3.0 (May 30, 2018)

- Bumped CSSTree to [1.0.0-alpha.29](https://github.com/csstree/csstree/releases/tag/v1.0.0-alpha.29)

## 1.2.2 (February 19, 2018)

- Bumped CSSTree to `1.0.0-alpha.28` (bug fixes)
- Bumped stylelint to `>=7.0.0 <10.0.0` and make it a peer dependency

## 1.2.1 (November 12, 2017)

- Bumped CSSTree to `1.0.0-alpha.26` (improved parsing and bug fixes)

## 1.2.0 (September 4, 2017)

- Bumped CSSTree to `1.0.0-alpha21` (improved parsing and updated property grammars)

## 1.1.1 (February 15, 2017)

- Ignore any declaration which property name looks using a preprocessor interpolation (e.g. `smth-@{foo}` or `smth-#{$foo}`)
- Ignore values with `Sass` interpolation (#7)

## 1.1.0 (February 14, 2017)

- Ignore `Less` and `Sass` var declarations that treats as regular declarations by PostCSS (#4)
- Implemented `ignore` option to define a list of property names that should be ignored by the validator. It may be used as a workaround to avoid warnings about syntax extensions (#5)

## 1.0.6 (February 12, 2017)

- Bump CSSTree to `1.0.0-alpha16`
- Ignore values with `Less` and `Sass` extensions (#3)

## 1.0.5 (January 19, 2017)

- Bump CSSTree to `1.0.0-alpha12`

## 1.0.4 (December 21, 2016)

- Bump CSSTree to `1.0.0-alpha9`

## 1.0.3 (November 21, 2016)

- Bump CSSTree to `1.0.0-alpha8`

## 1.0.2 (September 19, 2016)

- Bump CSSTree to `1.0.0-alpha5`

## 1.0.1 (September 17, 2016)

- Tweak description files

## 1.0.0 (September 17, 2016)

- Initial implementation
