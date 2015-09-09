import {Logger} from '../../lib/Logging/Logger.js';
import expect from 'expect.js';
import assert from "assert";
import simple from 'simple-mock';

describe('Logger',function(){
    afterEach(function() {
        simple.restore();
    });
    it("Should log if env is set to DEBUG",() => {
        process.env.LOG_LEVEL = 'DEBUG';

        var spy = simple.mock(console, 'log');
        Logger.log('test','me');
        expect(spy.called).to.be(true);
    });

    it("Should not log if env is not set to DEBUG",() => {
        process.env.LOG_LEVEL = '';

        var spy = simple.mock(console, 'log');
        Logger.log(['a','b','c']);
        expect(spy.called).to.be(false);
    });
});
