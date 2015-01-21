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
    console.log(this);
  }
});

Template.transfersNavigation.events({
  'click .delete-transfer': function () {
    return Transfers.remove({
      _id: this._id
    });
  },
  'click .nextBtn': function () {
    Router.go('/transfers/'+(this.page+1)+'/'+this.numberOfResultsPerPage);
  },
  'click .beforeBtn' : function () {
    var page = this.page-1;
    if(page.get!==0){
      Router.go('/transfers/'+page+'/'+this.numberOfResultsPerPage);
    }else{
      Router.go('/transfers/'+(page+1)+'/'+this.numberOfResultsPerPage);
    }
  }
});