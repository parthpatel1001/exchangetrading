import loader from 'es6-module-loader';
let System = loader.System;
System.transpiler = 'babel';
System.paths['babel'] = './node_modules/babel/node_modules/babel-core/browser.js';
System.paths['num'] = './node_modules/num/num.js';

export function SerializeObject(objToSerialize, fullPathToObjectWithClassName) {
    let serializer = function(obj, fullPathWithClassName) {
        let splitPath = fullPathToObjectWithClassName.split('/'),
            className = splitPath.splice(splitPath.length - 1, 1)[0]; // Remove the class name and store it for later

        console.log('path pieces', className, fullPathToObjectWithClassName, System.paths);

        return new Promise((resolve, reject) => {
            //console.log('starting inner promise');
            System.import(fullPathToObjectWithClassName).then((module) => {
                //let classToCreate = module[className];
                console.log('serializer is creating', module);
                resolve(true);
            }).catch((err) => {
                console.log('import error', err);
                reject(err);
            });
        });
    };

    return new Promise((resolve, reject) => {
        if(objToSerialize instanceof Array) {
            let promises = [];
            for(let objToSer of objToSerialize) {
                promises.push(serializer(objToSer, fullPathToObjectWithClassName));
            }

            Promise.all(promises).then((values) => {
                console.log('all objs serialized', values);
                resolve(values);
            });
        } else {
            serializer(objToSerialize, fullPathToObjectWithClassName).then((serialized) => {
                console.log('obj serialized', serialized);
                resolve(serialized);
            }).catch((err) => {
                console.log('serializer error', err);
                reject(err);
            });
        }
    });
}

export function DeserializeObject(objToDeserialize) {

}

// stolen from http://stackoverflow.com/questions/19098797/fastest-way-to-flatten-un-flatten-nested-json-objects
export function Unflatten(data) {
    "use strict";
    if (Object(data) !== data || Array.isArray(data))
        return data;
    var result = {}, cur, prop, idx, last, temp;
    for(var p in data) {
        cur = result, prop = "", last = 0;
        do {
            idx = p.indexOf(".", last);
            temp = p.substring(last, idx !== -1 ? idx : undefined);
            cur = cur[prop] || (cur[prop] = (!isNaN(parseInt(temp)) ? [] : {}));
            prop = temp;
            last = idx + 1;
        } while(idx >= 0);
        cur[prop] = data[p];
    }
    return result[""];
}

export function Flatten(data) {
    // sometimes things will JSON.stringify() _before_ getting here
    // this causes {'': "original string"} to get flattened
    // a stricter fix would be throwing an exception if typeof data !== 'Object'
    if (typeof data === "string") {
        return data;
    }

    var result = {};
    function recurse (cur, prop) {
        if (Object(cur) !== cur) {
            result[prop] = cur;
        } else if (Array.isArray(cur)) {
            for(var i=0, l=cur.length; i<l; i++)
                recurse(cur[i], prop ? prop+"."+i : ""+i);
            if (l == 0)
                result[prop] = [];
        } else {
            var isEmpty = true;
            for (var p in cur) {
                isEmpty = false;
                recurse(cur[p], prop ? prop+"."+p : p);
            }
            if (isEmpty)
                result[prop] = {};
        }
    }
    recurse(data, "");
    return result;
}

