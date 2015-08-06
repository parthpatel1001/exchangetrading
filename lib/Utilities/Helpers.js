// stolen from http://www.2ality.com/2015/02/es6-iteration.html
export function ObjectEntries(obj) {
    let index = 0;

    // In ES6, you can use strings or symbols as property keys,
    // Reflect.ownKeys() retrieves both
    let propKeys = Reflect.ownKeys(obj);

    return {
        [Symbol.iterator]() {
            return this;
        },
        next() {
            if (index < propKeys.length) {
                let key = propKeys[index];
                index++;
                return { value: [key, obj[key]] };
            } else {
                return { done: true };
            }
        }
    };
}

export const BUY_ORDER_TYPE = 'BUY';
export const SELL_ORDER_TYPE = 'SELL';

