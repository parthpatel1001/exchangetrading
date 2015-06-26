import config from 'config';

// statsd runner wants the json configuration location as a file path argument
if(process.env.NODE_ENV=='production') {
    process.argv[2] = config.get('Statsd.production_json_location');
}else {
    process.argv[2] = config.get('Statsd.development_json_location');
}

import statsd from '../statsd/stats.js'; // TODO: Does this work with the code above?
