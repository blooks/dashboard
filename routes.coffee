# Show sign-in page by default, whitelist pages you want to keep open
mustBeSignedIn = () ->
  unless Meteor.user() or Meteor.loggingIn()
    Router.go 'entrySignIn'
  else
    @next()
  return

# Require users to be signed in for all pages except these
Router.onBeforeAction mustBeSignedIn,
  except: [
    'entrySignIn'
    'entrySignUp'
    'entrySignOut'
    'entryForgotPassword'
    'contact'
    'about'
  ]

Router.map ->
  @route 'home',
    path: '/'

  @route 'dashboard',
    path: '/dashboard'
    waitOn: ->
      [
        Meteor.subscribe 'bitcoinwallets'
      ]

  @route 'trades',
    path: '/trades'
    waitOn: ->
      [
        Meteor.subscribe 'trades'
        Meteor.subscribe 'exchanges'
      ]
  @route 'transfers',
    path: '/transfers'
    waitOn: ->
      Session.setDefault('limitValues', 10) 
      Session.setDefault('page', 0)
      [
        Meteor.subscribe 'transfers', Session.get('limitValues'), Session.get('page')
      ]
    data: ->
      transfers: Transfers.find()
  @route 'nodes',
    path: '/nodes/nodesOverview'
    data: ->
      type:  'nodesOverview'

  @route '/nodes/:type',
    path: '/nodes/:type'
    template: 'nodes'
    data: ->
      type:  @params.type

  @route 'profileEdit',
    path: '/profile'
    template: 'userProfile'