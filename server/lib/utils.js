//var dateFormat = require("date-format");
var uniqid = require('uniqid');
var crypto = require('crypto');
var CryptoJS = require('crypto-js');
var moment = require('moment');
var fs = require('fs');

module.exports = {
    generateCode(prefix = "CODE", curIndex, loopNumber = 6, seperateChar = "_") {
        let _numberStr = curIndex ? curIndex.toString() : "1",
            _strOfZero = '0'.repeat(loopNumber - _numberStr.length > 0 ? loopNumber - _numberStr.length : 1);
        return prefix + seperateChar + _strOfZero + _numberStr;
    },
    formatDate: function (val, format) {
        if (val == 'now')
            return moment([]).format(format || "YYYY-MM-DD hh:mm:ss");

        if (!val) {
            return "";
        }
        return moment(val).format(format || "YYYY-MM-DD hh:mm:ss");
        //return dateFormat(format || 'yyyy-MM-dd hh:mm:ss', date);
    },
    diffDate: function (from, to, type) {
        return moment(from).diff(to, type || "seconds");
    },
    generateKey: function () {
        var uuid = "",
            hyphen = String.fromCharCode(45);
        charid = (crypto.createHash('md5').update(uniqid()).digest("hex")).toUpperCase();
        uuid = charid.substr(0, 8) + hyphen + charid.substr(8, 4) + hyphen + charid.substr(12, 4) + hyphen + charid.substr(16, 4) + hyphen + charid.substr(20, 4);
        return uuid.toLowerCase();
    },
    decrypt(text) {
        let secretKey = "authen-secret";
        let keySize = 256;
        let iterations = 100;
        let salt = CryptoJS.enc.Hex.parse(text.substr(0, 32));
        let iv = CryptoJS.enc.Hex.parse(text.substr(32, 32))
        let encrypted = text.substring(64);
        
        let key = CryptoJS.PBKDF2(secretKey, salt, {
            keySize: keySize/32,
            iterations: iterations
        });

        let decrypted = CryptoJS.AES.decrypt(encrypted, key, { 
            iv: iv, 
            padding: CryptoJS.pad.Pkcs7,
            mode: CryptoJS.mode.CBC
        });
        return decrypted.toString(CryptoJS.enc.Utf8);
    },
    convertStorage: function (val, from, to, diff) {
        if (!val || !from) {
            return "";
        }
        var rotate = 1;
        var mappingRate = {
            "BYTE_GB": 1 / Math.pow(1024, 3),
            "KB_GB": 1 / Math.pow(1024, 2),
            "MB_GB": 1 / 1024,
            "GB_GB": 1,
            "BYTE_TB": 1 / Math.pow(1024, 4)
        }

        if (mappingRate[from.toUpperCase() + "_" + to.toUpperCase()]) {
            rotate = mappingRate[from.toUpperCase() + "_" + to.toUpperCase()];
        }

        var rs = rotate * val;
        if (diff != undefined) {
            return Math.round(rs + diff * rs) + to;
        }

        return rs + to;
    },
    generateSecretKey: function (key) {
        if (typeof (key) !== "string" || key.trim() === "") return null;
        let result = '', length = key.length;
        let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let i = length; i > 0; --i) {
            result += chars[Math.floor(Math.random() * chars.length)] + key[i - 1];
        }
        let str = (crypto.createHash('sha512').update(result).digest("base64")).toUpperCase();
        return "2" + str.substr(1, str.length - 2) + "FA";
    },
    logFile: function (subject, data) {
        var dir = './log';

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        var file = dir + '/log_file_' + ((subject == 'uncaughtException') ? 'uncaughtexception' : 'server') + '.txt',
            d = new Date(),
            date = d.getUTCDate(),
            month = d.getUTCMonth() + 1,
            fullYear = d.getUTCFullYear(),
            hours = d.getHours(),
            minutes = d.getMinutes(),
            fullTime = fullYear + '-' + ((month < 10) ? '0' : '') + month + '-' + ((date < 10) ? '0' : '') + date + ' ' + hours + ':' + minutes;

        text = subject + ' | ' + data + ' ==========> ' + fullTime + '\r\n';

        fs.appendFile(file, text, function (err) {
            if (err)
                return console.log(err);
        });
    },
    objectSize: function (obj) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    },
    base64Encode: function (text, encoding = "utf8") {
        return new Buffer(text, encoding).toString("base64");
    },
    base64Decode: function (code, encoding = "utf8") {
        return new Buffer(code, "base64").toString(encoding);
    },
    getRegionCode: function (countrycode) {
        let regionCode = "";
        switch (countrycode) {
            case '1':
                regionCode = 'US';
                break;
            case '84':
                regionCode = 'VN';
                break;
        }
        return regionCode;
    },
    getUTCDate() {
        let d = new Date();
        return d.toUTCString();
    }
};

