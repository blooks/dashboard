Package.describe({
  summary: "Convert currencies according to historical rates.",
  version: "0.1.0"
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@0.9.3.1');
  api.use('coffeescript', ['client', 'server']);
  api.addFiles(['data/exchangerates.coffee','coynverter.js']);
  api.addFiles(['data/HistDollarPrices.csv', 'data/HistEuroPrices.csv'], 'server');
  api.export('Coynverter');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('coynverter');
  api.addFiles('coynverter-tests.js', 'server');
});
