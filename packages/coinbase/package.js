Package.describe({
  name: 'coyno:coinbase',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'This is a package for connecting Coinbase Accounts via oauth.',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0.5');
  api.addFiles('server/coinbase.js');
  api.export('Coinbase', 'server');
});

Npm.depends({
  "coinbase": "1.0.2"
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('coyno:coinbase');
  api.addFiles('coinbase-tests.js');
});
