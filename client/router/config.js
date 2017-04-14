Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  notFoundTemplate: 'notFound',
  yieldTemplates: {
    header: {
      to: 'header'
    },
    sidebar: {
      to: 'sidebar'
    },
    footer: {
      to: 'footer'
    }
  },
  onBeforeAction: function () {
    $('meta[name^="description"]').remove()
    this.next()
  }
})
