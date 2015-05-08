// on the client
Template.transfersNavigation.helpers({
  isLastPage: function () {
    return (this.page===this.totalPages);
  },
  isFirstPage: function () {
    return (this.page===1);
  },
  firstPage: function () {
    return 1;
  },
  lastPage: function () {
    return this.totalPages;
  },
  menuItems: function () {
    var menuItems = [];
    if(this.page === 1) {
      menuItems.push({});
      menuItems.push({});
      menuItems.push({});
    }
    if(this.page === 2) {
      menuItems.push({});
      menuItems.push({});
    }
    if(this.page === 3) {
      menuItems.push({});
    }
    if (1 === this.page) {
      menuItems.push({
        pageNumber: 1
      });
    } else {
      var linkToPage = ('/transfers/'+ 1 +'/'+this.numberOfResultsPerPage).toString();
      menuItems.push({
        pageNumber: 1,
        linkToPage: linkToPage
      });
    }
    if (this.page > 3 && this.totalPages > 3) {
      menuItems.push({pageNumber: "..."});
    }
    for(var i=Math.max(this.page-1,2); i<Math.min(this.page+2,this.totalPages); ++i) {
      if (i === this.page) {
        menuItems.push({
          pageNumber: i
        });
      } else {
        var linkToPage = ('/transfers/'+ i +'/'+this.numberOfResultsPerPage).toString();
        menuItems.push({
            pageNumber: i,
            linkToPage: linkToPage
          });
      }
    }

    if (this.page < this.totalPages - 2 ) {
      menuItems.push({pageNumber: "..."});
    }
    if (this.totalPages > 1) {
      if (this.page === this.totalPages) {
        menuItems.push({
          pageNumber: this.totalPages
        });
      } else {
        var linkToPage = ('/transfers/' + this.totalPages + '/' + this.numberOfResultsPerPage).toString();
        menuItems.push({
          pageNumber: this.totalPages,
          linkToPage: linkToPage
        });
      }
    }
    if(this.page === this.totalPages) {
      menuItems.push({});
      menuItems.push({});
      menuItems.push({});
    }
    if(this.page === this.totalPages -1) {
      menuItems.push({});
      menuItems.push({});
    }
    if(this.page === this.totalPages -2) {
      menuItems.push({});
    }
    return menuItems;
  },
  isActive: function (pageNumber) {
    if(String(pageNumber) ===Router.current().params.page){
      return 'active';
    }else{
      return '';
    }
  },
  //TODO @Levin. Code dup, please fix
  // Apply .ghost class to arrows when on first or final page
  hideNextArrow: function() {
    if(this.page===this.totalPages) {
      return 'ghost';
    } else {
      return '';
    }
  },
  hidePrevArrow: function() {
    if(this.page===1) {
      return 'ghost';
    } else {
      return '';
    }
  }
});

Template.transfersNavigation.events({
  'click .delete-transfer': function () {
    return Transfers.remove({
      _id: this._id
    });
  },
  'click .go-to-page': function (event) {
    event.preventDefault();
    Router.go('/transfers/'+event.target.attributes[1].value+'/10');
  },
  //TODO @Levin. Code dup, please fix
  // Cycle through pages with arrows
  'click .next-page': function () {
    var nextPage = this.page + 1;
    event.preventDefault();
    Router.go('/transfers/'+nextPage+'/10');
  },
  'click .prev-page': function () {
    var prevPage = this.page - 1;
    event.preventDefault();
    Router.go('/transfers/'+prevPage+'/10');
  }
});
