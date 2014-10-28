# Show sign-in page by default, whitelist pages you want to keep open
mustBeSignedIn = (pause) ->
  unless Meteor.user() or Meteor.loggingIn()
    Router.go "entrySignIn"
    pause()
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

Router.configure
  notFoundTemplate: 'notFound'

Router.onBeforeAction 'loading'

Router.map ->
  @route 'home',
    path: '/'

  @route 'dashboard',
    path: '/dashboard'

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
      [
        Meteor.subscribe 'transfers'
      ]

  @route 'nodes',
    path: '/nodes/:type'
    data:
      type:  @type
