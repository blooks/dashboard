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
    path: '/transfers/page/:number',
    template: 'transfers',
    waitOn: function() {
      Session.setDefault('limitValues', 10);
      Session.setDefault('page', 0);
      Session.set('page', parseInt(this.params.number)-1);
      return [Meteor.subscribe('transfers', Session.get('limitValues'), parseInt(this.params.number)-1)];
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
