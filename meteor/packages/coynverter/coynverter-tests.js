/**
 * The following tests have no special fixtures, if the rates used as sample are changed in the data files,
 * these tests may become outdated.
 */

var
  samplingDate = new Date('2013-05-20 00:00:00'),
  sampleEurUsd = {de: {USD: 1.2982}},
  sampleBtcFiat = {usd: 119.44195485, eur: 91.83072914},
  wrongDate = new Date('2000-05-20 00:00:00');

Tinytest.add('Retrieving rates', function (test) {
  // SETUP: uncomment the following line; can be moved into a special test for DB population
  // Coynverter.repopulateBtcToFiat();

  // normal usage
  test.equal(Coynverter.getExchangeRate('EUR', 'USD', samplingDate), sampleEurUsd.de.USD,
      'Compare EUR to USD rate on ' + samplingDate);
  test.equal(Coynverter.getExchangeRate('USD', 'EUR', samplingDate), 1/sampleEurUsd.de.USD,
      'Compare USD to EUR rate on ' + samplingDate);
  test.equal(Coynverter.getExchangeRate('BTC', 'USD', samplingDate), sampleBtcFiat.usd,
      'Compare BTC to USD rate on ' + samplingDate);
  test.equal(Coynverter.getExchangeRate('BTC', 'EUR', samplingDate), sampleBtcFiat.eur,
      'Compare BTC to EUR rate on ' + samplingDate);
  test.equal(Coynverter.getExchangeRate('EUR', 'BTC', samplingDate), 1/sampleBtcFiat.eur,
      'Compare EUR to BTC rate on ' + samplingDate);
  test.equal(Coynverter.getExchangeRate('USD', 'BTC', samplingDate), 1/sampleBtcFiat.usd,
      'Compare USD to BTC rate on ' + samplingDate);
  // wrong date
  test.isNull(Coynverter.getExchangeRate('USD', 'BTC', wrongDate), 'Wrong date USD-BTC');
  test.isNull(Coynverter.getExchangeRate('USD', 'EUR', wrongDate), 'Wrong date USD-EUR');
  test.isNull(Coynverter.getExchangeRate('EUR', 'BTC', wrongDate), 'Wrong date EUR-BTC');
  test.isNull(Coynverter.getExchangeRate('EUR', 'USD', wrongDate), 'Wrong date EUR-USD');
  test.isNull(Coynverter.getExchangeRate('BTC', 'EUR', wrongDate), 'Wrong date BTC-EUR');
  test.isNull(Coynverter.getExchangeRate('BTC', 'USD', wrongDate), 'Wrong date BTC-USD');
  // not supported currency
  try {
    Coynverter.getExchangeRate('BTC', 'RON', samplingDate);
  } catch (err) {
    test.instanceOf(err, Error);
  }
});

Tinytest.add('Calculate base amount', function (test) {
  var amount = 15;
  // normal usage
  test.equal(Coynverter.calculateBaseAmount(amount, 'USD', samplingDate), 1/sampleEurUsd.de.USD * amount,
    amount + 'USD in base currency on ' + samplingDate);
  test.equal(Coynverter.calculateBaseAmount(amount, null, samplingDate), 1/sampleEurUsd.de.USD * amount,
      amount + ' of default currency in base currency on ' + samplingDate);
  test.equal(Coynverter.calculateBaseAmount(amount, 'BTC', samplingDate), sampleBtcFiat.eur * amount,
      amount + 'BTC in base currency on ' + samplingDate);
  // wrong date
  test.isNull(Coynverter.calculateBaseAmount(amount, 'BTC', wrongDate), "Wrong date");
  // currency not supported
  try {
    Coynverter.calculateBaseAmount(amount, 'RON', samplingDate);
  } catch (err) {
    test.instanceOf(err, Error);
  }
});

