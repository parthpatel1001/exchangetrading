import StatsD from 'node-statsd';

let statsDClient = new StatsD();

export class Track {
    static gauge(key,value){
        console.log('gauge', key, value);
        statsDClient.gauge(key,value);
    };
}
