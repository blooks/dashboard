
var coinbase = Meteor.npmRequire('coinbase');

Coinbase = {
  clientId: "a487ae93c605709254bd63ff68481dffcd9593d7ae27dbb2a8e46ab39342c630",
  clientSecret: "34230828b64601d19844d207dc0a081e6c44cce58afe26ea8d2ed04482e34485"
}
/**
 *
 * @param code
 * @returns { access_token , refresh_token}
 */
Coinbase.authorize = function (code) {
  var queryUrl = "https://www.coinbase.com/oauth/token?grant_type=authorization_code&code=";
  queryUrl += code;
  queryUrl += "&redirect_uri=";
  queryUrl += "http://localhost:3000/addcoinbase"
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
