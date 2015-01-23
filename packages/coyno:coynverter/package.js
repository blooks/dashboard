Package.describe({
  name: 'coyno:coynverter',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/coyno/coyno-converter',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0.3.1');
  api.addFiles('coyno:coynverter.js');
  api.export('Coynverter', 'server');
});

Npm.depends({
  "coyno-converter": "0.0.16"
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('coyno:coynverter');
  api.addFiles('coyno:coynverter-tests.js');
});
