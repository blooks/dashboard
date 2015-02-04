// on the client
Template.transfersNavigation.helpers({
  lastPage: function () {
    return (this.page==this.totalPages);
  },
  firstPage: function () {
    return (this.page==1);
  },
  pagination: function () {
    var arrayWithNthPages = [];
    for(var i=0; i<this.totalPages; i++){
      arrayWithNthPages.push(i+1);
    }
    return arrayWithNthPages;
  },
  isActive: function (pageNumber) {
    if(pageNumber.toString()===Router.current().params.page){
      return 'active';
    }else{
      return '';
    }
  },
  linkToNextPage: function (){
    return '/transfers/'+(this.page+1)+'/'+this.numberOfResultsPerPage;
  },
  linkToBeforePage: function() {
    return '/transfers/'+(this.page-1)+'/'+this.numberOfResultsPerPage;
  }
});

Template.transfersNavigation.events({
  'click .delete-transfer': function () {
    return Transfers.remove({
      _id: this._id
    });
  },
  'click .go-to-page': function (event) {
    event.preventDefault();
    Router.go('/transfers/'+event.target.attributes[1].value+'/10');
  }
});
