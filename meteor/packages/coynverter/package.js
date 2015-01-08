Package.describe({
  summary: "Convert currencies according to historical rates.",
  version: "0.1.0"
});

Npm.depends({
  "bitcoinaverage-client":"0.0.5"
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@1.0.2');
  api.use('coffeescript', ['client', 'server']);
  api.use('meteorhacks:npm', 'server');
  api.use('chfritz:easycron', 'server');
  api.addFiles(['data/exchangerates.coffee','coynverter.js']);
  api.addFiles(['data/HistDollarPrices.csv', 'data/HistEuroPrices.csv'], 'server');
  api.export('Coynverter');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('coynverter');
  api.addFiles('coynverter-tests.js', 'server');
});
