'use strict';
let _email = require("emailjs");
const request = require('request');

let _emailServer = _email.server.connect({
    user: "duy.hngoc@gmail.com",
});

module.exports = {
    getConfig: function (email, subject, content) {
        return {
            text: subject,
            from: "test",
            to: email,
            subject: subject,
            attachment: [{
                data: content,
                alternative: true
            }]
        };
    },
    send: function (data) {
       return new Promise(function (resolve, reject) {
           console.log(data);
            request.post({
                url: 'http://10.2.25.3:8081/api/sendmail',
                body: data,
                json: true
            }, (err, httpRes, body) => {
                console.log(err);
            });
       });

    }
};