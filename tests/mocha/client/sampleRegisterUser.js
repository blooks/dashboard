if (typeof MochaWeb !== 'undefined') {
  MochaWeb.testOnly(function () {
    chai.should()
    var testUser = {
      email: 'foo@example.com',
      password: '123qweasd'
    }
    before(function (done) {
      if (Meteor.users.find({
          emails: {
            $elemMatch: {
              address: testUser.email
            }
          }
        }).count() === 0) {
        Accounts.createUser(testUser, done)
      }
      done()
    })

    describe('Not logged in', function () {
      before(function (done) {
        Meteor.logout(done)
      })

      it('should have the correct title on sign in page', function () {
        chai.expect($('.entry h3').html()).to.be.equal('Sign In')
      })
    })

    describe.skip('Logged in', function () {
      before(function (done) {
        Meteor.loginWithPassword(testUser.email, testUser.password, done)
      })

      it('should have the correct title on home page', function (done) {
        Router.go('home')
        setTimeout(function () {
          chai.expect($('h1').html()).to.be.equal('This is Blooks.')
          done()
        }, 200)
      })

      it('should have the correct title on dashboard', function (done) {
        Router.go('dashboard')
        setTimeout(function () {
          chai.expect($('h1').html()).to.be.equal('Dashboard')
          done()
        }, 200)
      })
    })
  })
}
