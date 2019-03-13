# REST In Peace

An expressive HTTP client for TypeScript

[![Build Status](https://travis-ci.com/digiwinfr/rip.svg?branch=develop)](https://travis-ci.com/digiwinfr/rip)
[![Coverage Status](https://coveralls.io/repos/github/digiwinfr/rip/badge.svg?branch=develop)](https://coveralls.io/github/digiwinfr/rip?branch=develop)
[![Maintainability](https://api.codeclimate.com/v1/badges/2118b0ff758b5e29cefb/maintainability)](https://codeclimate.com/github/digiwinfr/rip/maintainability)

## Build

```bash
npm build
```

## Test

Tests are written with Jest.

```bash
npm test

# Or with code coverage
npm run coverage
```

In case of running test suite with Webstorm 2018.3.5,  
the error `Class constructor Spec cannot be invoked without 'new'` is thrown,

The workaround consist in disabling `jest.test.tree.use.jasmine.reporter` registry key:

- `Help | Find Action...` on the main menu;
- Type `registry` and click `Registry...` found element;
- Find `jest.test.tree.use.jasmine.reporter` key and disable it.

This bug has been fixed in 2019.1 version.

**cf. https://youtrack.jetbrains.com/issue/WEB-37680**

## Lint

```bash
npm run lint
```
