# exchangetrading
```Javascript
# must have redis installed

npm install
npm install pm2 -g
cd Dashboard && npm install && bower install

# To Run The App:
export NODE_ENV=development
pm2 start pm2_app.json

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
