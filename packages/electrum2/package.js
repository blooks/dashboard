Package.describe({
  name: 'coyno:electrum2',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');
  api.use('coyno:bip32');
  api.addFiles('public/verification.js');
  api.export('Electrum2');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('coyno:electrum2');
  api.addFiles('electrum2-tests.js');
});
