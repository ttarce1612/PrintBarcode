/**
 * Copyright (c) 2019 OVTeam
 * Modified date: 2019/11/11
 * Modified by: Duy Huynh
 */

const axios = require('axios');
module.exports = {
    get: (uri, _params) => {
        return new Promise(resolve => {
            axios.get(uri, {
                params: _params || {},
                headers: {
                    'Access-Control-Allow-Origin': '*',
                }
            })
            .then((response)=> {
                resolve(response);
            })
        });
    },
    post: (uri, _data) => {
        return new Promise(resolve => {
            axios({ method: 'post', url: uri, data: _data || {},})
            .then((response)=>{
                resolve(response);
            })
        });
    },
    getWithCredentials: (uri, _params) => {
        return new Promise(resolve => {
            axios({ method: 'get', url: uri, params: _params || {}, withCredentials: true})
            .then(function(){
                console.log(111, this)
            })
        });
    }
}