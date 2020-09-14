'use strict';
var config = require("../config/config");
var _socket = null;
var _callback = null;


//Connect to socket io by a namespace
exports.connect = function(ns, opt) {
	//Close current connect
	this.close();
	
	if (String(ns)[0] !== '/' && ns) ns = '/' + ns;

	let authInfo = localStorage.getItem('acc');

	if(authInfo) {
		authInfo = JSON.parse(authInfo);
	} else {
		authInfo = {};
	}

	if(opt) {
		opt['transportOptions'] = {
			polling: {
			  extraHeaders: {
				'token': authInfo['token']||"",
				//'account': authInfo['loginname']||"",
				'withdevice': authInfo['withdevice']||false
			  }
			}
		  };
	} else {
		opt = {
			transportOptions: {
				polling: {
				extraHeaders: {
					'token': authInfo['token']||"",
					//'account': authInfo['loginname']||"",
					'withdevice': authInfo['withdevice']||false
				}
				}
		  }};
	}
        
	_socket = require('socket.io-client')(ns, opt);
        
	/*if(data == undefined) {
		var userInfo = JSON.parse(localStorage.getItem('acc'));
		data = {
			apikey: userInfo.token,
			room: userInfo.loginname
		}
	}*/
	//Connect error
	_socket.on('connect_error', function(){
		console.log("c-auto dis-connected to server.")
		
	});
	
	_socket.on('disconnect', function(){
		console.log("c-auto dis-connected to server.")
		_socket = null;
	});
        
	_socket.on('connect', function(){
		//_socket.clientId = "abcd";
		console.log("c-auto connected to server.")
	});
	
	/*_socket.on('disconnect', function(){
		console.log("c-auto disconnect to server.")
		_socket = null;
	});*/
	
	return _socket;
}

exports.hasConnection = function() {
	return _socket != null;
}

exports.getSocket = function() {
	return _socket;
}

exports.close = function()
{
	if (_socket != null) {
        _socket.disconnect();
    }
}