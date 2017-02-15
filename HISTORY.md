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
