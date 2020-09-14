'use strict'
var config = require("../config/config")
var _socket = null
var _callback = null

//Connect to socket io by a namespace
exports.connect = function(ns, data) {
    //Close current connect
    this.close();

    if(String(ns)[0] !== '/') ns = '/' + ns;

    let _host = window.location.protocol + "//" + window.location.host;
    
    _socket = require('socket.io-client')(_host + ns, {
        transportOptions: {
            polling: {
                extraHeaders: {
                    token: "",
                    accountname: ""
                }
            }
        }
    })

    //Connect error
    _socket.on('connect_error', function() {
        console.log("error connection")
    })

    _socket.on('disconnect', function() {
        console.log('dis-connected to server')
        //_socket = null
    })

    _socket.on('connect', function() {
        console.log('connected to server')
    })

    return _socket;
}

exports.hasConnection = function() {
    return _socket != null
}

exports.getSocket = function() {
    return _socket
}

exports.close = function() {
    if(_socket != null) {
        _socket.disconnect()
    }
}
