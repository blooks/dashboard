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
      return [Meteor.subscribe('bitcoinwallets')];
    }
  });
  this.route('transfers', {
    path: '/transfers',
    data: function() {
      return {
        pagenum: 0,
        amountperpage: 20
      };
    }
  });
  this.route('transfersPage', {
    path: '/transfers/:pagenum/:amountperpage',
    template: 'transfers',
    waitOn: function() {
      return [Meteor.subscribe('transfers', parseInt(this.params.amountperpage), parseInt(this.params.pagenum)-1)];
    },
    data: function() {
      if(Transfers.find() && Transfers.find().fetch().length>0){
        return {
          transfers: Transfers.find()
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
