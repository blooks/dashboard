if (this.Schemas == null) {
  this.Schemas = {};
}

Schemas.userProfile = new SimpleSchema({
  language: {
    type: String,
    optional: true
  },
  name: {
    type: String,
    optional: true
  },
  username: {
    type: String,
    optional: true
  },
  hasTransfers: {
    type: Boolean,
    defaultValue: false
  },
  hasSignedTOS: {
    type: Boolean,
    defaultValue: false
  },
  currency: {
    type: String,
    optional: true,
    allowedValues: ['EUR', 'USD', 'BTC'],
    defaultValue: 'EUR'
  },
  totalFiat: {
    type: Number,
    defaultValue: 0
  }
});
