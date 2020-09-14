/**
 * Copyright (c) 2019 OVTeam
 * Modified date: 2019/11/11
 * Modified by: Duy Huynh
 */

const CryptoJS = require('crypto-js');
// const jwdDecode = require('jwt-decode');
module.exports = {
  getClientInfo() {
    let full_name = window.localStorage.getItem('full_name');
    if(full_name) {
      return full_name
    }
    return null;
  },
  uid: (len) => {
    let out = "";
    for (let i = 0; i < 10; i++) {
      out += (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    return out;
  },
  encrypt(text) {
    let secretKey = "authen-secret";
    let keySize = 256;
    let ivSize = 128;
    let iterations = 100;
    let salt = CryptoJS.lib.WordArray.random(ivSize / 8);

    let key = CryptoJS.PBKDF2(secretKey, salt, {
      keySize: keySize / 32,
      iterations: iterations
    });

    let iv = CryptoJS.lib.WordArray.random(ivSize / 8);

    var encrypted = CryptoJS.AES.encrypt(text, key, {
      iv: iv,
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC
    });
    return salt.toString() + iv.toString() + encrypted.toString();
  },
  hash(text) {
    return CryptoJS.MD5(text).toString();
  },
  query(name, url) {
    url = url || window.location.search.toLowerCase();
    name = name.replace(/\[]/, '\\[').replace(/[\]]/, '\\]').toLowerCase();
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(url);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  }
}
