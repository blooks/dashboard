// on the client
Template.transfers.helpers({
  noLastPage: function () {
    if(Session.get('page')+1!==Session.get('numberOfPages')){
      return true;
    }
  },
  noZero: function () {
    if(Session.get('page')!==0){
      return true;
    }
  },
  actualPage: function () {
    //13-01-2015 LFG Avoid begin with page 0
    var actualPage = Session.get('page')+1;
    Meteor.call('totalTransfersPages', function (err, result) {
      if(err){
        Log.error(err);
      }
      if(result){
        Log.info(result);
        Session.set('numberOfPages', Math.round(result/Session.get('limitValues')));
      }
    });
    return actualPage +' of '+ Session.get('numberOfPages');
  }
});

Template.transfers.created = function () {
  Session.setDefault('limitValues', 10);
  Session.setDefault('page', 0);
};

Template.transfers.events({
  'click .delete-transfer': function () {
    return Transfers.remove({
      _id: this._id
    });
  },
  'click .nextBtn': function () {
    Session.set('page', Session.get('page')+1);
    console.log(parseInt(Session.get('page'))+1);
    var parsePage = parseInt(Session.get('page'))+1;
    Router.go('/transfers/page/'+parsePage);
  },
  'click .beforeBtn' : function () {
    Session.set('page', Session.get('page')-1);
    var parsePage = parseInt(Session.get('page'))+1;
    Router.go('/transfers/page/'+parsePage);
  },
});