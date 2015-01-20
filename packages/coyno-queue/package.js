Package.describe({
  name: 'coyno-queue',
  summary: 'Wrapper for coyno-queue npm package',
  version: '0.1.0'
});

Npm.depends({
  "coyno-queue-core": "0.1.5"
});

Package.onUse(function(api) {
  api.versionsFrom('1.0.2.1');
  api.addFiles('queue.js', 'server');
  api.export('Queue');
});
