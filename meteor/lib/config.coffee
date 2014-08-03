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

# Note: Meteor.settings.public only exists if is was declared in the settings
# json file when meteor was started. Thus, we test and initialise.
Meteor.settings.public = {} unless Meteor.settings.public?

Meteor.settings.public.coyno =
  allowedCurrencies: ['EUR', 'USD', 'BTC']
