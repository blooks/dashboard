Template.noData.rendered = function () {
 $('#noDataModal').modal({
    show: 'false',
  	backdrop: 'static',
  	keyboard: false
});
};

Template.noData.destroyed = function() {
  $('body').removeClass("modal-open");
  $('.modal-backdrop').fadeOut();
};
