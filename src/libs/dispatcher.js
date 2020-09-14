/**
 * Copyright (c) 2019 OVTeam
 * Modified date: 2019/11/11
 * Modified by: Duy Huynh
 */

let listeners = {};

/**
 * Broadcast event
 * @param {*} id 
 * @param {*} payload 
 */
function dispatch(id, payload) {
	console.log(listeners)
	if(id) {
		let ids = id.split(".");
		if(ids.length == 1) {
			if(listeners[ids[0]]) {
				if(typeof listeners[ids[0]] === "function") {
					listeners[ids[0]](payload);
				} else {
					for(let fn in listeners[ids[0]]) {
						listeners[ids[0]][fn](payload);
					}
				}
			}
		} else {
			if(listeners[ids[0]] && listeners[ids[0]][ids[1]]) {
				listeners[ids[0]][ids[1]](payload);
			}
		}
	}
}

/**
 * Register listner
 * @param {*} id Required, listener id
 * @param {*} cb Callback function
 * Example: dispatcher.register('nav_bar_toogle.level1', () => {})
 */
function register(id, cb) {
	console.log(id)
	let ids = id.split(".");
	if(ids.length > 2) {
		throw("Invalid");
	}
	if(ids.length == 1) {
		listeners[ids[0]] = cb;
	} else {
		if(!listeners[ids[0]]) {
			listeners[ids[0]] = {};
		}
		if(ids.length == 2) {
			listeners[ids[0]][ids[1]] = cb;
		}
	}
}

/**
 * Destroy listener
 * @param {*} id
 * Example: dispatcher.destroy('nav_bar_toogle.level1');
 */
function destroy(id) {
	let ids = id.split(".");
	if(ids.length > 2) {
		throw("Invalid");
	}
	let _id = ids[1]||"";
	if(_id) {
		delete listeners[ids[0]][_id];
	} else {
		delete listeners[ids[0]];
	}
}

module.exports = {
	register: register,
	dispatch: dispatch,
	destroy: destroy
}