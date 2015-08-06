/**
* Created by parthpatel1001 on 6/1/15.
*/
var simple = require('simple-mock');
import {OrderProcessor} from '../../lib/Order/OrderProcessor.js';
import {ExchangeManager} from '../../lib/Exchange/ExchangeManager.js';
import {OrderFactory} from '../../lib/Order/OrderFactory.js';
import {Balance} from '../../lib/Balance/Balance.js';
import {BitstampExchange} from '../../lib/Exchange/Bitstamp/BitstampExchange.js';
import assert from "assert";
var expect = require("expect.js");

var balanceIn = {},
	orderIn = {};

var orderProcessor = new OrderProcessor(ExchangeManager);

describe('OrderProcessor', function(){
	/*
	** Start makeSureEnoughBalance tests
	*/
	it('.processLinkedOrder() Should throw error on invalid order',function(){
		simple.mock(orderIn, 'orderType', 'INVALID');

		var order = {bad:'order'};
		var balance = new Balance(balanceIn);
		var exchange = new BitstampExchange();

		var fn = simple.mock(orderProcessor, 'makeSureEnoughBalance');
		expect(fn).withArgs(balance, order, exchange).to.throwError();
	});
    //
	it('.makeSureEnoughBalance() Expects true if enough money in balance to cover amount * price',function(){
		var order = OrderFactory.createBuyOrder({
            amount: 3,
            price: 12
        });
		var balance = Balance.createFromPlainObject({usd_avail:300,btc_avail:5,exchange_id:1});
		var exchange = new BitstampExchange();

		assert(orderProcessor.makeSureEnoughBalance(balance, order, exchange) === true);
	});
    //
    it('.makeSureEnoughBalance() Expects false if not enough money in balance to cover amount * price',function(){
        var order = OrderFactory.createBuyOrder({
            amount: 3,
            price: 12
        });
        var balance = Balance.createFromPlainObject({usd_avail:1,btc_avail:5,exchange_id:1});
        var exchange = new BitstampExchange();

        assert(orderProcessor.makeSureEnoughBalance(balance, order, exchange) === false);
    });

	it('.makeSureEnoughBalance() Expects to process sell order if enough BTC',function(){
        var order = OrderFactory.createSellOrder({
            amount: 3,
            price: 12
        });
        var balance = Balance.createFromPlainObject({usd_avail:1,btc_avail:5,exchange_id:1});
        var exchange = new BitstampExchange();

		assert(orderProcessor.makeSureEnoughBalance(balance, order, exchange) === true);
	});

	it('.makeSureEnoughBalance() Expects to not process sell order if not enough BTC',function(){
        var order = OrderFactory.createSellOrder({
            amount: 3,
            price: 12
        });
        var balance = Balance.createFromPlainObject({usd_avail:1,btc_avail:1,exchange_id:1});
        var exchange = new BitstampExchange();

        assert(orderProcessor.makeSureEnoughBalance(balance, order, exchange) === false);
	});
	/*
	** End makeSureEnoughBalance tests
	*/
});
