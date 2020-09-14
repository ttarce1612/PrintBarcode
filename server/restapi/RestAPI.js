/**
 * Copyright (c) 2019 OVTeam
 * Modified by: Duy Huynh
 * Modified date: 2019/11/11
 */
const request = require('request');
const { REST_API } = require('./../lib/constants'),
    syncLogHandle = require('./../handles/syncLogHandle');


function requestSite(api, params, apiPath = '/', persistent = false) {
    return new Promise(resolve => {
        request.post({
            url: `${REST_API.SITE.URL}/api/authentication/authentication/signin`,
            formData: {
                username: REST_API.SITE.USER,
                password: REST_API.SITE.TOKEN
            },
            json: true
        }, (err, httpRes, body) => {
            if (body && body.Data && body.Data.apikey) {
                const __token = body.Data.apikey;
                request.get(`${REST_API.SITE.URL}/api/security/screenid?apikey=${__token}&locationpath=${apiPath}`, { json: true },
                    (err2, httpRes2, screenResult) => {
                        if (screenResult && screenResult.Data && screenResult.Data.ScreenID) {
                            let apiParams = {
                                apikey: __token,
                                sc: screenResult.Data.ScreenID
                            };
                            if (persistent) {
                                apiParams.data = Array.isArray(params) ? params : [params || null];
                            } else {
                                apiParams.params = params || { limit: Number.MAX_SAFE_INTEGER, page: 1, start: 0 };
                            }
                            request.post({
                                url: `${REST_API.SITE.URL}${api}`,
                                body: apiParams,
                                json: true
                            }, (err3, httpRes3, res) => {
                                resolve(res);
                                if (!(/((\/getlist)|(\/combo))/ig).test(api) || !res.Success) {
                                    // Ignore the large data
                                    drawLog(api, REST_API.SITE.URL, params, res);
                                }
                                request.post({
                                    url: `${REST_API.SITE.URL}/api/authentication/authentication/signout`,
                                    body: apiParams,
                                    json: true
                                }, (err4, httpRes4, res4) => { });

                            });
                        } else {
                            resolve({ status: false, data: 'Screen denied.' });
                            drawLog(api, REST_API.SITE.URL, params, screenResult);
                        }
                    });
            } else {
                resolve({ status: false, data: 'Accessed denied.' });
                drawLog(api, REST_API.SITE.URL, params, body);
            }
        });
    });
}

module.exports = {
    requestSite
}