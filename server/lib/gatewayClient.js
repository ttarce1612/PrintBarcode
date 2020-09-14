/**
 * Centralize System
 * Modified by: Duy Huynh
 * Modified date: 2020/01
 */
const io = require('socket.io-client');

const transportOptions = {
  polling: {
    extraHeaders: {
      'ist': APP_NAME
    }
  }
}

/**
 * Initial Gateway Client Socket
 */
exports.initApp = function () {
  global.CLIENT_APP = io(APP_GATEWAY_CONNECTION, {
    transportOptions: transportOptions
  });

  CLIENT_APP.on('connect', () => {
    console.log("Connect to Gateway successful!.")
  });
}


