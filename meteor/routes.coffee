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

Router.map ->
  @route 'home',
    path: '/'

  @route 'dashboard',
    path: '/dashboard'

  @route 'transactions',
    path: '/transactions'
    waitOn: ->
      [
        Meteor.subscribe 'transactions'
      ]
  #js this.route('transactions', {path: '/transactions'});

  @route 'upload',
    path: '/upload'

  @route 'nodes',
    path: '/nodes'

  @route 'notFound',
    path: '*'
    where: 'server'
    action: ->
      @response.statusCode = 404
      @response.end Handlebars.templates['404']()
