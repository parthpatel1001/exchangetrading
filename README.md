# exchangetrading

[![Build Status](http://54.175.194.132:8080/buildStatus/icon?job=ExchangeTrading)](http://54.175.194.132:8080/job/ExchangeTrading/)

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

