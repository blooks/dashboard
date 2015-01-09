if (typeof MochaWeb !== "undefined") {
  MochaWeb.testOnly(function () {
    chai.should();

    describe("Bitcoin calculations", function () {
      it("should work with satoshis", function () {
        (0.1 * 10e8 + 0.2 * 10e8).should.equal(0.3 * 10e8);
      });

      it("should not work with floats", function () {
        (0.1 + 0.2).should.not.equal(0.3);
      });

      it("should work with satoshis async", function (done) {
        setTimeout(function () {
          (0.1 * 10e8 + 0.2 * 10e8).should.equal(0.3 * 10e8);
          done();
        }, 100);
      });

      it("should not work with floats async", function (done) {
        setTimeout(function () {
          (0.1 + 0.2).should.not.equal(0.3);
          done();
        }, 100);
      });
    });
  });
}
