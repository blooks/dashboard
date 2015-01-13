Router.configure
  layoutTemplate: 'layout'
  loadingTemplate: 'loading'
  notFoundTemplate: 'notFound'
  yieldTemplates:
    header:
      to: 'header'
    sidebar:
      to: 'sidebar'
    footer:
      to: 'footer'
  onBeforeAction: ->
    $('meta[name^="description"]').remove()
    @next()
    return
