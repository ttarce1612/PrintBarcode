'use strict';
var _socket = null;
var _time = 0;
var _timer = null;
let _waitingScreen = true;
// var popups = require("popups");


//Connect to socket io by a namespace
exports.connect = function() {
	//Close current connect
	// this.close();
	
	// let authInfo = localStorage.getItem('acc');

	// if(authInfo) {
	// 	authInfo = JSON.parse(authInfo);
	// } else {
	// 	authInfo = {};
	// }
	// console.log(813)
        
	 _socket = require('socket.io-client')("/socket/dashboard");
        
	//Connect error
	_socket.on('connect_error', function(e) {
		
		if(_waitingScreen == true && e.message == "xhr poll error" && _time == 0) {
			_time += 1;
			// popups.modal({
			// 	title: "Network Error",
			// 	closeBtn: "",
			// 	additionalBaseClass: 'rconnect',
			// 	content: "<span style='color: red; font-size:40px;'>Reconnect <span id='rtime'>00:00:00</span></span>",
			// 	onClose: function() {
			// 		if(_timer) {
			// 			clearInterval(_timer);
			// 		}
			// 		_timer = null;
			// 		_time = 0;
			// 	}
			// });

			_timer = setInterval(function() {
				if(!this.sec)
					this.sec = 0;
				this.sec += 1;
				rconenct(this.sec);

				if(this.sec == 59)
					this.sec = 0;
			}, 1000);
		}
	});
	
	_socket.on('disconnect', function(){
		console.log("dis-connected to server.")
	});
        
	_socket.on('connect', function(e, f) {
		console.log("connected to server.");
		_time = 0;
		if(_timer && _waitingScreen == true) {
			clearInterval(_timer);
			// popups._hide();
			_timer = null;
			window.location.reload();
		}
	});
	
	_socket.on('reconnect', function() {
		if(_waitingScreen == true) {
			window.location.reload();
		}
	});

	//Count down for reconnect
	function rconenct(sec) {
		var ele = document.getElementById("rtime");
		if(ele) {
			var text = "";
			var h = 0;
			var min = 0;

			if(sec == 59) {
				_time += sec;
			}
			if(sec == 1)
				_time += 1;

			if(_time < 3600 && _time > 59) {
				min = Math.floor(_time/60);
			} else {
				h = Math.floor(_time/3600);
				min = _time - (h*3600);
				if(min > 0) {
					min = Math.floor(min/60);
				}
			}
		
			text += h > 10? h: ("0"+h);
			text += ":"
			text += min >= 10? min: ("0"+min);
			text += ":"
			text += sec >= 10 ? sec : ("0"+sec);

			ele.innerText = text
		}
	}
	
	return _socket;
}

exports.hasConnection = function() {
	return _socket != null;
}

exports.getSocket = function() {
	// if(_socket == null) {
	// 	console.log(9214)
	// 	_socket = exports.connect("/", 'p');
	// }
	return _socket;
}

exports.close = function()
{
	if (_socket != null) {
        _socket.disconnect();
    }
}

exports.allowWaiting = function(status) {
	_waitingScreen = status
}