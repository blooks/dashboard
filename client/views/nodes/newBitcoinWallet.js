Template.newBitcoinWallet.created = function() {
  this.newWalletStage = new ReactiveVar('first','');
  this.newWalletData = new ReactiveVar(false,'');
  this.newWalletFormValid = new ReactiveVar(false,'');
  this.newWalletFormValidLabel = new ReactiveVar(false,'');
  this.newWalletFormValidSeed = new ReactiveVar(false,'');
};

Template.newBitcoinWallet.helpers({
 areWeOnThisStage: function(s) {
    var stage = Template.instance().newWalletStage.get();
    return Template.instance().newWalletStage.get()===s;
  },
  getNewWalletData: function(s) {
    return Template.instance().newWalletData.get();
  },
  getLogoImageFromWalletType: function(s) {
    if (s==='Single Address') return '/img/wallet-icon-default.png' 
    return '/img/external-logos/' + s.replace(/\s/g, '-').toLowerCase() + '-logo.png';
  },
  isElectrum: function() {
    return (this.type==='Electrum')
  },
  isBitcoinWallet: function() {
    return (this.type==='Bitcoin Wallet')
  },
  validForm: function() {
    return (Template.instance().newWalletFormValid.get());
  },
  validFormSeed: function() {
    return (Template.instance().newWalletFormValidSeed.get());
  },
  validFormLabel: function() {
    return (Template.instance().newWalletFormValidLabel.get());
  },
  getWalletFormatFromWalletType: function(s) {
    // DGB 2015-01-21 08:33 This is needed to respect Erasmus wording, but it is not very elegant or easy to maintain and I can see a lot of trouble in the future 
    if (s==='Bitcoin Wallet') return 'BIP32';
    if (s==='Single Address') return 'Single Addresses';
    return s; // DGB 2015-01-21 08:25 True for Armory & Electrum
  }
});

// DGB 2015-01-22 05:43 
// defined with var so it is only on the scope of THIS template
// Template.newBitcoinWallet.validateLabel = function(label) {
var validateLabel = function(label,type) {
  return BitcoinWallets.simpleSchema().namedContext().validate({$set:{'label':label, 'type':type}}, {modifier: true});
};
var validateSeed = function(hdseed,type) {
  return BitcoinWallets.simpleSchema().namedContext().validate({$set:{'hdseed':hdseed, 'type':type}}, {modifier: true});
};
var validateType = function(type) {
  return BitcoinWallets.simpleSchema().namedContext().validate({$set:{'type':type}}, {modifier: true});
};


Template.newBitcoinWallet.events({
  'keyup form, blur input': function(event,template) {
    var form = event.target.parentNode.parentNode;
    var validationLabel = validateLabel(form.label.value,form.type.value);
    // DGB 2015-01-22 07:46 Needed because conditions are different for the
    // Account containers 
    if (form.type.value!=='Single Addresses') {
      var validationSeed = validateSeed(form.hdseed.value,form.type.value);
      template.newWalletFormValid.set(validationLabel && validationSeed && validateType(form.type.value));
      template.newWalletFormValidSeed.set(validationSeed);
    }
    else {
      template.newWalletFormValid.set(validationLabel && validateType(form.type.value));
    }
    template.newWalletFormValidLabel.set(validationLabel);
  },
  'click .back': function (event,template) {
    template.newWalletFormValid.set(false);
    template.newWalletFormValidLabel.set(false);
    template.newWalletFormValidSeed.set(false);
    template.newWalletStage.set('first');

  },
  'click .wallet-thumbs': function (event,template) {
    // DGB 2015-01-20 06:57 There are better ways to get this data
    var wallet=$($(event.currentTarget).children()[1]).html()
    if (!(['Electrum','Bitcoin Wallet','Single Address'].indexOf(wallet) === -1)) {
      template.newWalletData.set({type:wallet});
      template.newWalletStage.set('second');
    }
  },
  'submit form': function(event,template) {
    event.preventDefault();
    event.stopPropagation();
    
    if (!template.newWalletFormValid.get()) {
      // DGB 2015-01-22 05:26 Validation failed
      // We should not reach this stage because the user should not be allowed
      // to click in the button
      return 
    }
    // DGB 2015-01-22 05:25 If we are still here means that the 
    // data is valid (Or looks valid at least)
    // WARNING Allowing these inserts on the browser doesn't look like a very
    // smart idea, a user could create a loop on the browser and associate a
    // ton of garbage wallets on his account, which is an expensive process on our side -> afterwards our servers will
    // need to process and waste bandwidth and CPU cycles. Maybe we  need to give this a thought.
    
    // DGB 2015-01-22 08:51 userId is actually not needed, it is overwriten by the insert funcion at
    // model level
    var newWallet = {userId: Meteor.userId(), label:  event.target.label.value, type: event.target.type.value};
    if (event.target.type.value!=='Single Addresses'){
      newWallet.hdseed = event.target.hdseed.value;
    }
        BitcoinWallets.insert(newWallet, function(err,result) {
      if (err) {
        console.log(err);
      }
      if (result) {
        console.log('Added Wallet Succesfully')
      }
    });

    // DGB 2015-01-22 08:50 The insert takes a *REALLY* long time because we make a remote API call to get the acocunts. Until we improve this and delay/defer this to a bg process, we need to fake it till we make it.
    
    template.newWalletStage.set('first');
    Router.go('/nodes/bitcoinWallets');

  }
});


