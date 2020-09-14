const config = require('./../config');

module.exports = Object.freeze({
    AuthKeys: {
        OTP_SEED: "2FA",
        OTP_PSW_EXPIRED: 7200, //300 second ~ 5 minutes, 7200 ~ 2 hour
        OTP_MAIL: "2FAEL",
        OTP_MAIL_EXPIRED: 60, //60 second
        OTP_SMS: "2FATP",
        OTP_SMS_EXPIRED: 60, //60 second
        OTP_COUNTS: 3, //3 times
        OTP_COUNTS_NAME: "2FALOCKED",
        OTP_EXPIRED: 60, //60 second
        ACCOUNT_LOCKED: "AUTHLOCKED",
        TOKEN_APP_EXPIRED: 60, //60 minutes
        TOKEN_APP_NAME: "AUTHTOK",
        RESET_PWD_NO: 4,
        LENGTH_CHAR: 10,
        HYPERLINK_EXPIRED_TIME: (new Date(new Date().getTime() + 60 * 60 * 24 * 1000)).toUTCString(),
        AUTO_TIMEOUT: 300000, // 24 hours ~ 86400000, 5 minute ~ 300000 ms
    },
    ShaVariant: {
        SHA_1: "SHA-1",
        SHA_256: "SHA-256",
        SHA_512: "SHA-512"
    },
    REST_API: {
        SITE: {
            URL: config.demoURL,
            USER: 'duyhuynh',
            TOKEN: 'password'
        }
    },
    SendSMSInfo: {
        VIRTUAL_NUMBER: "+18555606622",
        APIKEY: "ACa2ecfb046725709047f4e01740304ff7",
        API_SECRET: "6bf48fcefa6f4a7ced06dc5652f65eb2",
        REQUEST_TIME: 10
    },
    SYNC_SITE: {
        SITE: "DEMO"
    }
});