import config from 'config';

// statsd runner wants the json configuration location as a file path argument
if(process.env.NODE_ENV=='production') {
    process.argv[2] = config.get('Statsd.production_json_location');
}else {
    process.argv[2] = config.get('Statsd.development_json_location');
}

// Can't make the below an import because babel will move it above the arg code above which needs to be run before it
var statsd = require('../statsd/stats.js');
