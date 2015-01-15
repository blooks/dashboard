 Template.sidebar.events({
   'click .navbar-toggle': function (event, template) {
     // DGB 2015-01-12 07:32
     // This is hacky, but there are not many more options as this version of
     // sidebar.js doesn't have callbacks.
     // Here we don't prevent default event, so sidebar.js can continue.
     if ($('.icon-left-open-big').length) {
       $('.icon-left-open-big').removeClass('icon-left-open-big').addClass('icon-right-open-big');
     }
     else {
       $('.icon-right-open-big').removeClass('icon-right-open-big').addClass('icon-left-open-big');
     }
 	},
  'click #transfers': function () {
    Router.go('/transfers/page/1');
  }
});

Template.sidebar.helpers({
  isActive: function (section) {
    return (section===Router.current().route.getName());
  },
});


