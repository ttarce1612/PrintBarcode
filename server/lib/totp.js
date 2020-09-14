'use strict';
let jsSHA = require("jssha");
const { ShaVariant, AuthKeys } = require("./constants");

/*Convert decimal to hexadecimal*/
function dec2hex(s) {
    return (s < 15.5 ? '0' : '') + Math.round(s).toString(16);
}

/*Convert hexadecimal string to decimal*/
function hex2dec(s) {
    return parseInt(s, 16);
}

/*Fill in the left of str a pad value to str.length == len*/
function leftpad(str, len, pad) {
    if (len + 1 >= str.length) {
        str = Array(len + 1 - str.length).join(pad) + str;
    }
    return str;
}

/*Convert string "base32" to hexadecimal*/
function base32tohex(base32) {
    let base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let bits = "", hex = "";

    for (let i = 0; i < base32.length; i++) {
        let val = base32chars.indexOf(base32.charAt(i).toUpperCase());
        bits += leftpad(val.toString(2), 5, '0');
    }

    for (let i = 0; i + 4 <= bits.length; i += 4) {
        let chunk = bits.substr(i, 4);
        hex = hex + parseInt(chunk, 2).toString(16);
    }
    return hex;
}

/*Get UTC timestamp*/
function getUTCTimestamp() {
    let dateTime = new Date();
    return Date.parse(dateTime.toUTCString());
}

module.exports = {
    otp: function (seedcode, option) {
        let opt = option || {};
        // The life cycle (s) of an OTP code
        if (!opt.timestep) {
            opt.timestep = AuthKeys.OTP_EXPIRED;
        }
        if (!opt.sha) {
            opt.sha = ShaVariant.SHA_512;
        }
        // Create a secret key from seedcode
        let key = base32tohex(seedcode);
        if (key.length % 2 !== 0) {
            key = leftpad(key, key.length + 1, '0');
        }
        // Calculate time for generating OTP code
        let T0_epoch = Math.round(getUTCTimestamp() / 1000.0);
        let T_time = leftpad(dec2hex(Math.floor(T0_epoch / opt.timestep)), 16, '0');

        let shaObj = new jsSHA(opt.sha, "HEX");
        shaObj.setHMACKey(key, "HEX");
        shaObj.update(T_time);

        let hmac = shaObj.getHMAC("HEX");
        let offset = hex2dec(hmac.substring(hmac.length - 1));
        let otp = (hex2dec(hmac.substr(offset * 2, 8)) & hex2dec('7fffffff')) + '';
        return (otp).substr(otp.length - 6, 6);
    }
};