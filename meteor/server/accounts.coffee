Meteor.startup ->
  AccountsEntry.config
    signupCode: null


Accounts.onCreateUser (options, user) ->

  ## create the dummy data for a new user
  user.dummyNodes = [
    {network:'Bitcoin',name:'Dummy Bitcoin Wallet'},{network:'Exchange',name:"Dummy Exchange"},{network:'BankAccount',name:'Dummy Bank Account'}
  ]

  console.log 'adding dummy data to new user'
  console.log user


  return user

