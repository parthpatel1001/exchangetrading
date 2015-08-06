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
    it("Should log if the env is DEBUG",function(){
        process.env.LOG_LEVEL = 'DEBUG';
        console.log = simple.spy(function(){
            var args = Array.prototype.slice.call(arguments);
            expect(console.log.called).to.be(true);
            assert(args.indexOf('test') !== -1);
            assert(args.indexOf('me') !== -1);

        });
        Logger.log('test','me');
    });

    it("Should log if the env is DEBUG",function(){
        process.env.LOG_LEVEL = '';
        console.log = simple.spy(function(){
            var args = Array.prototype.slice.call(arguments);
            expect(console.log.called).to.be(false);
        });
        Logger.log(['a','b','c']);
    });
});