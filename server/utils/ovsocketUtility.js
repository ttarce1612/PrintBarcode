'use strict';

/**
 * Description: Initial socket IO from http server instance of nodejs
 * Params: HttpServer
 */
exports.init = function (httpServer) {
    this.io = require('socket.io')(httpServer);
    
}

/**
 * Description: Declare a namespace
 * @param: <string> ns the name of namespace
 * @return: <object> Namespace
 */
exports.nsp = function (ns) {
    return this.io.of(ns)
}

/**
 * Description: Register event on socket IO
 * @param: <sting> eventName The name of event listener
 * @param: <function> handler The handler of event listener
 */
exports.on = function (eventName, handler) {
    this.io.on(eventName, handler)
}

/**
 * Description: Check exist a namespace
 * @param: <string> ns The name of namespace
 */
exports.hasNsp = function (ns) {
    if (this.io != null && this.io.nsps[ns] != undefined) {
        return true;
    }
    return false;
}