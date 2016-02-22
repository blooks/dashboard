
var coinbase = Npm.require('coinbase');

Coinbase = {
  clientId: process.env.COINBASE_ID,
  clientSecret: process.env.COINBASE_SECRET
}
/**
 *
 * @param code
 * @returns { access_token , refresh_token, externalId, userName}
 */
Coinbase.authorize = function (code) {
  var queryUrl = "https://www.coinbase.com/oauth/token?grant_type=authorization_code&code=";
  queryUrl += code;
  queryUrl += "&redirect_uri=";
  queryUrl += "https://app.coyno.com/addcoinbase"
  queryUrl += "&client_id=";
  queryUrl += this.clientId;
  queryUrl += "&client_secret=";
  queryUrl += this.clientSecret;
  try {
    var response = HTTP.post(queryUrl);
  } catch (err) {
    console.log(err);
    return;
  }
  if (response) {
    if (response.data) {
      var coinbaseClient = new coinbase.Client({
        apiKey : " ",
        apiSecret : " ",
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token
      })
      getUser = Meteor.wrapAsync(coinbaseClient.getCurrentUser, coinbaseClient);
      var coinbaseUser = getUser();
      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        externalId: coinbaseUser.id,
        userName: coinbaseUser.name
      }
    }
  }
}
