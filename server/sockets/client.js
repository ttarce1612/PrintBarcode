/**
 * Centralize System
 * Modified by: Duy Huynh
 * Modified date: 2020/01
 */
const io = require('socket.io-client');
const CLIENT_INSTANCE = 'OVADASHBOARD';

const transportOptions = {
  polling: {
    extraHeaders: {
      'ist': CLIENT_INSTANCE
    }
  }
}

exports.initApp = function () {

  global.CLIENT_APP = io('http://localhost:9099/' + CLIENT_INSTANCE, {
    transportOptions: transportOptions
  });

  CLIENT_APP.on('connect', () => {
    console.log("Connect to Gateway successful Yeahhh!!!!.")
  });
 
  // CLIENT_APP.on('api_auth_outbounds', (data, requestid) => {
  //   console.log("api_auth_outbounds", data, requestid)
  //   // CLIENT_APP.emit("api_auth_outbounds_" + requestid, {Status: true, Data: null}, id)
  // })
}


