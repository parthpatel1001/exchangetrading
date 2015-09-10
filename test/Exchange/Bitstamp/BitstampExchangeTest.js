import num from 'num';
import config from 'config';
import assert from "assert";
import {BitstampExchange} from '../../../lib/Exchange/Wrappers/BitstampExchange';
import {BuyOrder} from '../../../lib/Order/BuyOrder.js'
import {SellOrder} from '../../../lib/Order/SellOrder.js'
import {Balance} from '../../../lib/Balance/Balance.js'

describe('BitstampExchange', function(){
    let name = 'Bitstamp',
        exchangeId = config.get('Exchange.Bitstamp.id'),
        fee = num(config.get('Exchange.Bitstamp.trade_fee'));

    it('Should have correct name, exchangeId, and fee', () => {
        let exch = new BitstampExchange();

        assert(exch.Name === name);
        assert(exch.ExchangeId === exchangeId);
        assert(exch.Fee.toString() === fee.toString()); // TODO: How to test num's without the .toString()?
    });

    it('Should have specific implementation of processOrder', () => {
        let exch = new BitstampExchange(),
            order = new BuyOrder(1, 2, 3, exch);

        let res = exch.processOrder(order);
        assert(res === false);
        // TODO: This test sucks. We need a way to:
        //   1: Check the real impl of processOrder
        //   2: Convert processOrder into a promise based thing as it's calling an asyn func
        //        Unless we don't care about the response from bitstamp?
    });

    it('Should have specific implementation of getBalance', (done) => {
        let exch = new BitstampExchange();
        exch.getBalance((err, newBal) => {
            assert(err === null);
            assert(newBal instanceof Balance); // Can't check newBal's values as they're Math.random() calls in dev
            done();
        })
    });

    it('Should have specific implementation of noTrade', () => {
        let exch = new BitstampExchange(),
            bidAmt = num(1),
            bidPrice = num(2),
            askAmt = num(1),
            askPrice = num(2),
            result = exch.noTrade({
                bid: {
                    amount: bidAmt,
                    price: bidPrice
                },
                ask: {
                    amount: askAmt,
                    price: askPrice
                }
            });

        assert(result === name + ' (['+ bidAmt.set_precision(4).toString() + ','
            + bidPrice.set_precision(4).toString() + ']['
            + askAmt.set_precision(4).toString() + ','
            + askPrice.set_precision(4).toString() + '])');
    });
});
