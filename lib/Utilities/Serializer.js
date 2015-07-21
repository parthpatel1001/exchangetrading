var System = require('es6-module-loader').System;
System.transpiler = 'babel';

export function SerializeObject(objToSerialize, fullPathToObjectWithClassName) {
    let serializer = function(obj, fullPathWithClassName) {
        let splitPath = fullPathToObjectWithClassName.split('/'),
            className = splitPath.splice(splitPath.length - 1, 1)[0]; // Remove the class name and store it for later

        let fullPath = splitPath.join('/');

        System.import(fullPath).then(function(module) {
            let classToCreate = module[className];
            console.log('serializer is creating', classToCreate);
        });
    };

    if(objToSerialize instanceof Array) {
        let retVal = [];
        for(let objToSer of objToSerialize) {
            retVal.push(serializer(objToSer, fullPathToObjectWithClassName));
        }
        return retVal;
    } else {
        return serializer(objToSerialize, fullPathToObjectWithClassName);
    }
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

