/**
 * Created by parthpatel1001 on 8/3/15.
 */
import {Logger} from '../../lib/Utilities/Logger.js';
var expect = require('expect.js');
import assert from "assert";
var simple = require('simple-mock');

describe('Logger',function(){
    afterEach(function() {
        simple.restore();
    });
    it("Should log if env is set to DEBUG",function(){
        process.env.LOG_LEVEL = 'DEBUG';

        var spy = simple.mock(console, 'log');
        Logger.log('test','me');
        expect(spy.called).to.be(true);
    });

    it("Should not log if env is not set to DEBUG",function(){
        process.env.LOG_LEVEL = '';

        var spy = simple.mock(console, 'log');
        Logger.log(['a','b','c']);
        expect(spy.called).to.be(false);
    });
});