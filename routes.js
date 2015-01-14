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
  this.route('transfers_user', {
    template: 'transfers',
    action: function() {
      Router.go('/transfers/1/10');
    }
  });
  this.route('transfers', {
    path: '/transfers/:page/:numberOfResults',
    template: 'transfers',
    waitOn: function() {
      console.log("Page: "+this.params.page);
      console.log("Number of results to show: "+this.params.numberOfResults);
      return [Meteor.subscribe('transfers', parseInt(this.params.page), parseInt(this.params.numberOfResults))];
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
        type: 'nodesOverview'
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
