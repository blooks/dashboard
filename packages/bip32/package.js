Package.describe({
  name: 'coyno:bip32',
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
  api.use('olragon:uri-js');
  api.addFiles('public/verification.js');
  api.addFiles('server/verification.js', 'server');
  api.export('BIP32');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('coyno:bip32');
  api.addFiles('bip32-tests.js');
});

Npm.depends({
  'bitcore-lib': 'https://github.com/satoshipay/bitcore-lib/archive/82696cf1ad495ce097876ab9d376e30976bb7abe.tar.gz'
});
