Template.sidebar.created = function () {
  $('html').on('click.bs.sidebar.autohide', function (event) {
    Meteor.setTimeout(function () {
      var target = $('.sidebar')
      if (target.hasClass('sidebar-open')) {
        $('.sidebar .icon-right-open-big').removeClass('icon-right-open-big').addClass('icon-left-open-big')
      } else {
        $('.sidebar .icon-left-open-big').removeClass('icon-left-open-big').addClass('icon-right-open-big')
      }
    }, 200)
  })
}

Template.sidebar.helpers({
  isActive: function (section) {
    if (section === this.type) {
      return 'active'
    }
    return ''
  },
  /*
   notGuest: function() {
   return !Meteor.user().profile.guest
   }
   */
})
