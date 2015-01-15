var mustBeSignedIn = function() {
  if (!(Meteor.user() || Meteor.loggingIn())) {
    Router.go('entrySignIn');
  } else {
    this.next();
  }
};

Router.onBeforeAction(mustBeSignedIn, {
  except: ['entrySignIn', 'entrySignUp', 'entrySignOut', 'entryForgotPassword', 'contact', 'about']
});

Router.map(function() {
  this.route('home', {
    path: '/'
  });
  this.route('dashboard', {
    path: '/dashboard',
    waitOn: function() {
      return [Meteor.subscribe('bitcoinwallets'), Meteor.subscribe('transfers')];
    }
  });
  this.route('transfers_user', {
    template: 'transfers',
    action: function() {
      Router.go('/transfers/1/10');
    }
  });
  this.route('transfers', {
    path: '/transfers/:page/:numberOfResults',
    template: 'transfers',
    loadingTemplate: '',
    data: function() {
      Meteor.subscribe('transfers', parseInt(this.params.page), parseInt(this.params.numberOfResults));
      if(Transfers.find() && Transfers.find().fetch().length>0){
        return {
          transfers: Transfers.find(),
          page: parseInt(this.params.page),
          numberOfResultsPerPage: parseInt(this.params.numberOfResults),
          totalPages:  Math.ceil(Transfers.findOne({}).totalAvailable/parseInt(this.params.numberOfResults))
        };
      }else{
        return {
          noTransfers: 0
        };
      }
    }
  });
  this.route('nodes', {
    path: '/nodes/nodesOverview',
    data: function() {
      return {
        type: 'bitcoinWallets'
      };
    }
  });
  this.route('/nodes/:type', {
    path: '/nodes/:type',
    template: 'nodes',
    data: function() {
      return {
        type: this.params.type
      };
    }
  });
  return this.route('profileEdit', {
    path: '/profile',
    template: 'userProfile'
  });
});
