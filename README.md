# exchangetrading

[![Build Status](http://jenkins.tpitech.io/jenkins/buildStatus/icon?job=exchangetrading-build)](http://jenkins.tpitech.io/jenkins/job/exchangetrading-build/)

## Install

### Global Installs
- [redis](http://redis.io)
- [pm2](https://github.com/Unitech/pm2)
- [bower](http://bower.io)
```
brew install redis
npm install pm2 -g
npm install bower -g
npm install mocha -g
npm install gulp -g
```

### Init Git Submodules
[git submodules](https://git-scm.com/book/en/v2/Git-Tools-Submodules#Cloning-a-Project-with-Submodules)
```
git submodule init
git submodule update
```

### Init npm packages
```
npm install
```

### Legacy dashboard
We might not use the dashboard anymore, but the existing old one is here:
```
cd Dashboard && npm install && bower install
```
Uncomment the dashboard app in [pm2_app.json](https://github.com/parthpatel1001/exchangetrading/blob/master/pm2_app.json)

## To Run The App:
export NODE_ENV=development
pm2 start pm2_app.json

### show list of running process'
pm2 list

### watch logs
pm2 logs

### monitor process'
pm2 monit

### restart process'
pm2 restart all

## To compile down es6
`gulp babel`

## Node Version

Make sure your node version is
```
parthpatel1001@Parths-MBP-2:~/Dropbox/code/exchangetrading (es6) $ node -v
v0.12.5
```

## Run tests using
mocha
