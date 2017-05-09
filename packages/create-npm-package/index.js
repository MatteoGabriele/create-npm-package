#!/usr/bin/env node

var currentNodeVersion = process.versions.node;
if (currentNodeVersion.split('.')[0] < 6) {
  console.error(
    'You are running Node ' +
      currentNodeVersion +
      '.\n' +
      'Create NPM package requires Node 6 or higher. \n' +
      'Please update your version of Node.'
  );
  process.exit(1)
}

require('./create-npm-package')
