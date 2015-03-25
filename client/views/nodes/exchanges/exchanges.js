Template.exchanges.helpers({
  exchangesinpacks: function (numberInPack) {
    var result = [];
    var temp = [];
    Exchanges.find().forEach(function (exchange) {
      temp.push(exchange);
      if (temp.length > (numberInPack - 1)) {
        result.push(temp);
        temp = [];
      }
    });
    if (temp.length > 0) {
      result.push(temp);
    }
    return result;
  },
  exchanges: function () {
    return Exchanges.find().fetch();
  },
  dynamicTemplate: function() {
    if (this.action === "add") {
      return "chooseExchange";
    }
    return "";
  }
});
