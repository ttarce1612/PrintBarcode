
const request = require('request');
exports.post = (url, data, headers = null) => {
    return new Promise((resolve) => {
        let options = {
            'method': 'POST',
            'url': url,
            'headers': headers || {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            form: data
        };
        request(options, function (error, response) {
            let data = {
                Body: response.body,
                statusCode: response.statusCode
            }
            resolve(data);
        });
    })
}
