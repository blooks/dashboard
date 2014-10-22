Accounts.onCreateUser(function(options, user) {

  var dummyBitcoinWallet = {
    userId: user._id,
    label: 'Dummy Bitcoin Wallet',
    device: 'BitcoinWallet'
  };
  var dummyBitcoinWalletId
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

  user.dummyNodes = [
    {
      type: 'Bitcoin',
      nodeId: dummyBitcoinWalletId
    },
    {
      type: 'BankAccount',
      nodeId: dummyBankAccountId
    }
  ];
  return user;
});
