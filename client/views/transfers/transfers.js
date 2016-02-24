function download(filename, json) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:json/plain;charset=utf-8,' + encodeURIComponent(json));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

Template.transfers.rendered = function () {
  $('[data-toggle="tooltip"]').tooltip();
};

Template.transfers.events = {
  'click #downloadTransfers': function() {
    Meteor.call('allTransfers', function(err, transfers) {
      if (err) {
        return;
      }
      download('allTransfers.json', transfers);
    });
  }
};
