/**
 * Created by parthpatel1001 on 8/3/15.
 */
var os = require("os");

export class Logger {
    static log(){
        var args = Array.prototype.slice.call(arguments);
        args.unshift(
            [new Date().getTime()],
            [os.hostname()]
        );

        if(process.env.LOG_LEVEL && process.env.LOG_LEVEL == 'DEBUG') {
            console.log.apply(
                console.log,
                args
            );
        }
    }
}