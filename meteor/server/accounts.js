Accounts.onCreateUser(function(options, user) {

  var dummyBitcoinWallet = {
    userId: user._id,
    label: 'Dummy Bitcoin Wallet',
    device: 'BitcoinWallet'
  };
  var dummyBankAccount = {
    userId: user._id,
    label: 'Dummy Bank Account',
    currency: 'EUR'
  };
  var dummyBitcoinWalletId
  try  {
     dummyBitcoinWalletId = BitcoinWallets.insert(dummyBitcoinWallet);
    } catch (error) {
      console.log(error);
    }
  user.dummyNodes = [
    {
      network: 'Bitcoin',
      name: 'Dummy Bitcoin Wallet'
    },
    {
      network: 'BankAccount',
      name: 'Dummy Bank Account'
    }
  ];
  return user;
});
