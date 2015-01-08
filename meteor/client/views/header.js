Template.header.events({
  'click #menu-toggle': function (e) {
    e.preventDefault();
    $("#wrapper").toggleClass("nav-toggled");
  }
});
