Notification = new Mongo.Collection('servernotifications');

if (Schemas == null) {
  Schemas = {};
}

Schemas.Notifications = new SimpleSchema({
  userId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  type: {
    type: String,
    defaultValue: 'info'
  },
  title: {
    type: String
  },
  message: {
    type: String,
    optional: true
  }
});

Notification.attachSchema(Schemas.Notifications);

Notification.timed();

Notification.owned();

Notification.allow({
  insert: function(userId, item) {
    if (userId == null) {
      throw new Meteor.Error(400, "You need to log in to insert.");
    }
    return _.extend(item, {
      userId: userId
    });
  },
  update: function(userId, doc, filedNames, modifier) {
    if (userId !== doc.userId) {
      throw new Meteor.Error(400, "You can only edit your own entries.");
    }
    return true;
  },
  remove: function(userId, doc) {
    if (doc.userId !== userId) {
      throw new Meteor.Error(400, "You can only delete your own entries.");
    }
    return true;
  }
});

if (Meteor.isServer) {
  Notification.info =  function (title, message) {
    if (Meteor.userId()) {
      Notification.insert({userId: Meteor.userId(), title: title, message: message});
    }
    };
    Notification.error = function (title, message) {
      if (Meteor.userId()) {
        Notification.insert({userId: Meteor.userId(), type: 'error', title: title, message: message});
      }
    };
    Notification.success = function (title, message) {
      if (Meteor.userId()) {
        Notification.insert({userId: Meteor.userId(), type: 'success', title: title, message: message});
      }
    };
}
