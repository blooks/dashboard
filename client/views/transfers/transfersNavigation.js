var valuesToShow = new ReactiveVar(10);
var page = new ReactiveVar(1);
var numberOfPages = new ReactiveVar(1);

// on the client
Template.transfersNavigation.helpers({
  noLastPage: function () {
    if(page.get()!==numberOfPages.get()){
      return true;
    }
  },
  noZero: function () {
    if(page.get()!==1){
      return true;
    }
  },
  totalPages: function () {
    Meteor.call('totalTransfersPages', function (err, result) {
      if(err){
        Log.error(err);
      }
      if(result){
        numberOfPages.set(Math.round(result/valuesToShow.get()));
      }
    });
    return numberOfPages.get();
  }
});

Template.transfersNavigation.events({
  'click .delete-transfer': function () {
    return Transfers.remove({
      _id: this._id
    });
  },
  'click .nextBtn': function () {
    page.set(page.get()+1);
    Router.go('/transfers/'+page.get()+'/'+valuesToShow.get());
  },
  'click .beforeBtn' : function () {
    page.set(page.get()-1);
    if(page.get!==0){
      Router.go('/transfers/'+page.get()+'/'+valuesToShow.get());
    }else{
      Router.go('/transfers/'+page.get()+'/'+valuesToShow.get());
    }
  }
});