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

For wallet updates etc. install coyno-queue in another folder:
```
npm install coyno-queue
```

Go to npm-packages/coyno-queue. 

Run 

```
COYNO_QUEUE_PROCESSORS=*.* COYNO_QUEUE_LOG_PRETTY=true COYNO_QUEUE_UI_PORT=3010 node index.js
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
