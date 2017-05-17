# Contributing

## Important notes
Please don't edit files in the `dist` subdirectory as they are generated via Webpack 2.
 
You'll find source code in the `app` subdirectory!

### Code style
Regarding code style like indentation and whitespace, **follow the conventions you see used in the source already.**

### Jest
While Jest is used for unit tests, this shouldn't be considered a substitute for the real thing. Please be sure that feature is working by opening `index.html` in _actual_ browsers.

## Modifying the code
First, ensure that you have the latest [Node.js](http://nodejs.org/) and [npm](http://npmjs.org/) installed.

1. Fork and clone the repo.
1. Run `npm install` to install all dependencies.

Just be sure to run existing tests after making any changes, to ensure that nothing is broken.

## Submitting pull requests

1. Create a new branch, please don't work in your `master` branch directly.
1. Add failing tests for the change you want to make. Run `npm test` to see the tests fail.
1. Add changes / Fix stuff.
1. Run `npm test` to see if the tests pass. Repeat steps 2-4 until done.
1. Open `index.html` in actual browser to ensure feature is working.
1. Update the documentation to reflect any changes.
1. Push to your fork and submit a pull request.
