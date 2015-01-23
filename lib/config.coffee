# Global config that's on both client and server

# Set the default language
i18n.setDefaultLanguage 'en_GB'

# Show placeholders if translated string doesn't exist
i18n.showMissing(true)

#
# Settings
#
# Meteor settings are put into Meteor.settings
# Meteor.settings.public is also available on the client, the rest not
# As this file is in lib/ it's on both client and server, so all settings
# defined here should be defined under Meteor.settings.public
# Note: Meteor.settings is initialised on meteor startup, see:
# http://docs.meteor.com/#meteor_settings

# Ensure Meteor.settings always exists on the client. It won't exist if meteor
# was started without a --settings parameter.
if Meteor.isClient and not Meteor.settings?
  Meteor.settings = {}

# Note: Meteor.settings.public only exists if is was declared in the settings
# json file when meteor was started. Thus, we test and initialise.
Meteor.settings.public = {} unless Meteor.settings.public?

Meteor.settings.public.coyno =
  allowedCurrencies: ['EUR', 'USD', 'BTC', 'XRP', 'Altcoin']
  valuedCurrencies: ['EUR', 'USD', 'BTC']
  defaultJurisdiction: 'de'
  allowedNodeTypes: ['Exchange', 'BankAccount', 'BitcoinWallet']
  supportedExchanges: ['Bitstamp', 'Kraken']
  allowedBanks: ['BankAccount']
  supportedBitcoinWalletTypes: ['bitcoin-wallet', 'electrum', 'single-addresses']
  availableWallets: [{type: 'bitcoin-wallet', label: 'Bitcoin Wallet'},
                    {type: 'electrum', label: 'Electrum'},
    {type: 'single-addresses', label: 'Single Addresses'}]
  unavailableWallets: [{type: 'armory', label: 'Armory'},
    {type: 'trezor', label: 'Trezor'},
    {type: 'multibit', label: 'MultiBit'},
    {type: 'green-address-wallet', label: 'Green Address'},
    {type: 'hive-wallet', label: 'Hive'},
    {type: 'breadwallet', label: 'Bread Wallet'},
    {type: 'mycelium', label: 'Mycelium'},
    {type: 'kncwallet', label: 'KnC'},
    {type: 'msigna', label: 'mSigna'}]
