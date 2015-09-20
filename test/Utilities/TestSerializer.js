import {Flatten, Unflatten} from '../../lib/Utilities/Serializer';
import expect from 'expect.js';
import assert from "assert";

describe('Flatten',function(){
    it("Should not try to flatten a string", () => {
        assert("dont serialize me" === Flatten("dont serialize me"));
        assert("{even:'im a object string'}" === Flatten("{even:'im a object string'}"));
    })
});
