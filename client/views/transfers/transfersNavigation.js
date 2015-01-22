// on the client
Template.transfersNavigation.helpers({
  noLastPage: function () {
    if(this.page!==this.totalPages){
      return true;
    }
  },
  noZero: function () {
    if(this.page!==1){
      return true;
    }
  },
  pagination: function () {
    var arrayWithNthPages = [];
    for(var i=0; i<this.totalPages; i++){
      arrayWithNthPages.push(i+1);
    }
    return arrayWithNthPages;
  }
});

Template.transfersNavigation.events({
  'click .delete-transfer': function () {
    return Transfers.remove({
      _id: this._id
    });
  },
  'click .next_button': function () {
    Router.go('/transfers/'+(this.page+1)+'/'+this.numberOfResultsPerPage);
  },
  'click .before_button' : function () {
    var page = this.page-1;
    if(page.get!==0){
      Router.go('/transfers/'+page+'/'+this.numberOfResultsPerPage);
    }else{
      Router.go('/transfers/'+(page+1)+'/'+this.numberOfResultsPerPage);
    }
  },
  'click .page_to_go': function (event) {
    Router.go('/transfers/'+event.target.attributes[1].value+'/10');
  }
});