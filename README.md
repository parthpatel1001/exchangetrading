# exchangetrading
```Javascript
# must have redis installed

npm install
npm install pm2 -g
cd Dashboard && npm install && bower install
node run.js # from root

# show list of running process'
pm2 list

# watch logs
pm2 logs

# monitor process'
pm2 monit

# express folder watches for changes and restarts the node process
# to restart all process:
pm2 restart all
```
