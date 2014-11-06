// on the client
Template.dynamicNodeMenu.helpers({
    isActive : function(currentNodeView) {
        if (this.type == currentNodeView) {
            return "active";
        }
        return "";
    }
});