Template.nodes.helpers({
  heading: function () {
    return 'nodes.headings.' + this.type
  },
  iconType: function () {
    switch (this.type) {
      case 'bitcoinWallets':
        return 'wallet'
      case 'exchanges':
        return 'exchange'
    }
  }
})
