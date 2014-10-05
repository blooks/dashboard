
Template.registerHelper 'convertToBitcoin', (satoshis)->
  inBitcoin = satoshis/100000000