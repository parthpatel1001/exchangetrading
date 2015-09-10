import num from 'num';
import config from 'config';
import assert from "assert";
import {OrderBookTranslatorBase} from '../../../lib/OrderBook/Translators/TranslatorBase';
import {BitFinExOrderBookTranslator} from '../../../lib/OrderBook/Translators/BitFinEx';
import {BitstampExchange} from '../../../lib/Exchange/Wrappers/BitstampExchange';

describe('OrderBookTranslatorBase', function(){
    it('Should have an exchange and subscribe function', () => {
        let exch = new BitstampExchange();

        let testMe = new OrderBookTranslatorBase(exch);

        assert(testMe.Exchange === exch);
        assert(testMe.subscribe instanceof Function);
    });
});
