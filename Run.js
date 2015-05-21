/**
 * Created by parthpatel1001 on 5/9/15.
 */
var pm2 = require('pm2');

pm2.connect(function(err) {
    pm2.start('pm2_app.json'
        , function(err, proc) {
            if (err) throw new Error('err');
            pm2.disconnect(function() { process.exit(0) });
        });
});
