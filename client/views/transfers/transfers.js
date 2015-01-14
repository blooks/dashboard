var valuesToShow = new ReactiveVar(10);
var page = new ReactiveVar(1);
var numberOfPages = new ReactiveVar(1);

// on the client
Template.transfers.helpers({
  noLastPage: function () {
    if(page.get()+1!==numberOfPages.get()){
      return true;
    }
  },
  noZero: function () {
    if(page.get()!==0){
      return true;
    }
  },
  actualPage: function () {
    //13-01-2015 LFG Avoid begin with page 0
    Meteor.call('totalTransfersPages', function (err, result) {
      if(err){
        Log.error(err);
      }
      if(result){
        numberOfPages.set(Math.round(result/valuesToShow.get()));
      }
    });
    return (page.get()+1) +' of '+ numberOfPages.get();
  }
});

Template.transfers.rendered = function () {
  $('[data-toggle="tooltip"]').tooltip();
};

Template.transfers.events({
  'click .delete-transfer': function () {
    return Transfers.remove({
      _id: this._id
    });
  },
  'click .nextBtn': function () {
    page.set(page.get()+1);
    console.log(page.get());
    Router.go('/transfers/'+page.get()+'/'+valuesToShow.get());
  },
  'click .beforeBtn' : function () {
    page.set(page.get()-1);
    console.log(page.get());
    if(page.get!==0){
      Router.go('/transfers/'+(page.get()+1)+'/'+valuesToShow.get());
    }else{
      Router.go('/transfers/'+page.get()+'/'+valuesToShow.get());
    }
  }
});