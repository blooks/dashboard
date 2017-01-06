var mustHaveSignedTOS = function () {
  if (Meteor.user() && Meteor.user().profile && !Meteor.user().profile.guest && !Meteor.user().profile.hasSignedTOS) {
    Router.go('termsOfService')
  } else {
    this.next()
  }
}
Router.onBeforeAction(mustHaveSignedTOS, {
  except: ['atSignIn', 'atSignUp', 'atResetPwd', 'atEnrollAccount', 'atChangePwd', 'atForgotPwd', 'atVerifyEmail', 'termsOfService']
})
Router.plugin('ensureSignedIn', {
  except: ['atSignIn', 'atSignUp', 'atResetPwd', 'atEnrollAccount', 'atChangePwd', 'atForgotPwd', 'atVerifyEmail']
})

Router.map(function () {
  this.route('/', {
    action: function () {
      Router.go('/dashboard')
    }
  })
  this.route('dashboard', {
    path: '/dashboard',
    action: function () {
      Router.go('/dashboard/netWorth/fiat')
    }
  })
  this.route('home', {
    path: '/home',
    template: 'home'
  })
  this.route('transfers_user', {
    template: 'transfers',
    waitOn: function () {
      return [ Meteor.subscribe('user') ]
    },
    action: function () {
      Router.go('/transfers/1/10')
    }
  })
  this.route('termsOfService', {
    waitOn: function () {
      return [ Meteor.subscribe('user') ]
    }
  })
  this.route('transfers', {
    path: '/transfers/:page/:numberOfResults',
    template: 'transfers',
    loadingTemplate: '',
    waitOn: function () {
      return [ Meteor.subscribe('user') ]
    },
    data: function () {
      Meteor.subscribe('transfers', parseInt(this.params.page, 10), parseInt(this.params.numberOfResults, 10))
      if (Transfers.find() && Transfers.find().fetch().length > 0) {
        var numTotalTransfers = Transfers.findOne({}).totalAvailable
        var numberOfResultsPerPage = parseInt(this.params.numberOfResults, 10)
        var totalPages = Math.ceil(numTotalTransfers / numberOfResultsPerPage)
        var page = parseInt(this.params.page, 10)
        if (page > totalPages) {
          return Router.go('/transfers/' + totalPages + '/' + numberOfResultsPerPage)
        }
        return {
          noTransfers: false,
          transfers: Transfers.find(),
          page: page,
          numberOfResultsPerPage: numberOfResultsPerPage,
          totalPages: totalPages
        }
      } else {
        return {
          noTransfers: true
        }
      }
    }
  })
  this.route('dashboardtype', {
    path: '/dashboard/:type/:currency?',
    template: 'dashboard',
    waitOn: function () {
      return [
        Meteor.subscribe('user'),
        Meteor.subscribe('bitcoinwallets'),
        Meteor.subscribe('transfers')
      ]
    },
    data: function () {
      return {
        type: this.params.type,
        currency: (this.params.currency || 'fiat')
      }
    }
  })
  this.route('/nodes', {
    action: function () {
      Router.go('/nodes/bitcoinWallets')
    }
  })
  this.route('nodesdetails', {
    path: '/nodes/:type/:action?/:actiontype?',
    template: 'nodes',
    data: function () {
      return {
        type: this.params.type,
        action: this.params.action,
        actiontype: this.params.actiontype
      }
    }
  })

  this.route('nodesAddWallet', {
    path: '/nodes/bitcoinWallets/add'
  })

  this.route('nodesAddExchange', {
    path: '/nodes/exchanges/add'
  })

  this.route('profileEdit', {
    path: '/profile',
    template: 'userProfile'
  })
  this.route('addcoinbase', {
    path: '/addcoinbase',
    action: function () {
      Meteor.call('addCoinbaseAccount', this.params.query.code)
      Router.go('/nodes/exchanges')
    }
  })
})
