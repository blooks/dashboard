Coyno - The Bitcoin Bookkeeper


### Status
[![Build Status](https://api.travis-ci.com/coyno/coyno.svg?token=1hmYcmiyeZnWxKt7Gzzv)](https://api.travis-ci.com/coyno/coyno.svg?token=1hmYcmiyeZnWxKt7Gzzv)

TBD

A bookkeeping software for bitcoin traders.

All rights reserved.

# Running the App


## Requirements

* Meteor
* Redis-Server
* coyno-queue

## Run

In the root directory

```
meteor
```

For wallet updates etc. you need to also run coyno-runner.
If you want to start coyno runner for the first time, go to another folder and do:
```
git clone git@github.com:coyno/coyno-runner.git
cd coyno-runner
npm install
```
If you already have a local copy of coyno-runner go the its directory and do:

```
git pull
npm install
```
Then start the process:

```
QUEUE_UI_PORT=3010 PRETTY_LOGS=true LOG_LEVEL=trace WORKERS=*.*:5 node index.js -wum
```

# Development

## Git flow

To work on a feature use following command:
```
git flow feature start name-of-feature-branch
```

If your feature is ready to be merged, *DO NOT* use git flow finish command. 

~~```git flow feature finish```~~

Instead pull and merge latest changes from develop to your feature branch and publish your feature.

```
git flow feature publish 
```

Then submit pull request on Github.

Git flow cheatsheet here: http://danielkummer.github.io/git-flow-cheatsheet/
