 Template.sidebar.events({
   'click .sidebar': function (event, template) {
     // DGB 2015-01-12 07:32
     // This is hacky, but there are not many more options as this version of
     // sidebar.js doesn't have callbacks. 
     // Here we don't prevent default event, so sidebar.js can continue.
     if ($('.fa-chevron-left').length) {
       $('.fa-chevron-left').removeClass('fa-chevron-left').addClass('fa-chevron-right');
     }
     else {
       $('.fa-chevron-right').removeClass('fa-chevron-right').addClass('fa-chevron-left');
     }
 	},
});
