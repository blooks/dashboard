// on the client
Template.dynamicNodeMenu.helpers({
    isActive : function(type) {
        if (this.type == type) {
            return "active";
        }
        return "";
    }
});