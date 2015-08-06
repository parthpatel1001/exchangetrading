import assert from "assert";
import {ExchangeBase} from '../../lib/Exchange/ExchangeBase.js';

describe('ExchangeBase', () => {
    it('Should have the expected properties defined',() => {
        let name = 'hello',
            exchId = 100,
            fee = 50;
        let exchBase = new ExchangeBase(name, exchId, fee);

        assert(exchBase.Name == name);
        assert(exchBase.ExchangeId == exchId);
        assert(exchBase.Fee == fee);
        assert(exchBase.getBalance instanceof Function);
        assert(exchBase.noTrade instanceof Function);
        assert(exchBase.processOrder instanceof Function);

        let checkThrow = (funcToCall) => {
            let callThrew = false;
            try{
                funcToCall();
            } catch(e) {
                callThrew = true;
            }
            assert(callThrew === true);
        };

        checkThrow(exchBase.getBalance);
        checkThrow(exchBase.noTrade);
        checkThrow(exchBase.processOrder);
    });
});
