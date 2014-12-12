describe("BlockchainData", function() {


    beforeEach(function() {
    });

    it("should attach Coyno props", function() {
        var transfer = {};
        var wallet = {"_id": 1};
        var result = addCoynoData(transfer, wallet);
        expect(result.userId).toEqual(Meteor.userId());
        expect(result.sourceId).toEqual(1);
    });

});
