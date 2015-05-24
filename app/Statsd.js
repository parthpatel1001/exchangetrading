/**
 * Created by parthpatel1001 on 5/23/15.
 */
var config = require('config');

// statsd runner wants the json configuration location as a file path argument
if(process.env.NODE_ENV=='production') {
    process.argv[2] = config.get('Statsd.production_json_location');
}else {
    process.argv[2] = config.get('Statsd.development_json_location');
}

var statsd = require('../statsd/stats.js');