Electrum = {}

Electrum.verifyMPK = function (mpk) {
  return mpk.match(/^[a-f0-9]{128}$/);
};
