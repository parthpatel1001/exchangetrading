/*
** Makes calls to our external SQL server to store/retrieve orders made
*/

import request from 'request';
import path from 'path';

let baseURL = '';

export class Table {
	static index(callback) {
		request.get(baseURL, (err, res, body) => {
			if(!err && res.statusCode == 200) {
				callback(body);
			}
		});
	}

	static show(id, callback) {
		request.get(path.join(baseURL, id), (err, res, body) => {
			if(!err && res.statusCode == 200) {
				callback(body);
			}
		});
	}

	static store(obj, callback) {
		request.post(baseURL, {form: obj});
	}

	
}