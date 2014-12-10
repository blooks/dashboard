Accounts.onCreateUser(function(options, user) {

  var dummyBitcoinWallet = {
    userId: user._id,
    type: 'Single Addresses',
    label: 'Dummy Wallet'
  };
  var dummyBitcoinWalletId;
  try  {
     dummyBitcoinWalletId = BitcoinWallets.insert(dummyBitcoinWallet);
    } catch (error) {
      console.log(error);
    }
  var dummyBankAccount = {
    userId: user._id,
    label: 'Dummy Bank Account',
    currency: 'EUR'
  };
  var dummyBankAccountId;
  try  {
     dummyBankAccountId = BankAccounts.insert(dummyBankAccount);
    } catch (error) {
      console.log(error);
    }
  var rippleBankAccount = {
    userId: user._id,
    label: 'Ripple Wallet',
    currency: 'XRP'
  };
  var dummyRippleAccountId;
  try {
    dummyRippleAccountId = BankAccounts.insert(rippleBankAccount);
  } catch (error) {
    console.log(error);
  }
  user.profile =
  {
    'dummyNodeIds' : {
      'BTC': dummyBitcoinWalletId,
      'EUR': dummyBankAccountId,
      'XRP': dummyRippleAccountId
    }
  };
  return user;
});