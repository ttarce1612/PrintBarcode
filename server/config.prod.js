/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

let configs = {
    DEFAULT_CONNECTION: "mongodb://ovdevops:pR557aK0b1et@61.28.233.213:27017/ovlegend?authSource=admin"
}

/**
 * Load global configuration
 */
exports.loadConfigs = () => {
    global.APP_NAME = "OVDASHBOARD";
    global.APP_GATEWAY_CONNECTION = "http://localhost:9099/OVDASHBOARD";
    global.LOGGER_CONNECTION = "http://103.130.218.167:8000";
}

/**
 * Get configuration list
 */
exports.getConfigs = () => {
    return configs;
}


//GLOBAL VARIABLE
exports.env = "prod";
exports.port = 2025;
exports.demoURL = "http://localhost";
exports.baseURL = "http://localhost:2021";
exports.ovauthURL = "http://localhost:3000";
exports.ovakaiURL = "http://localhost:2022";

exports.cookieTimeout = new Date((new Date().getFullYear() + 2), new Date().getMonth(), new Date().getDate()) // 1000 * 60 * 60 * 24 * 7; // 7 days
exports.sessionTimeout = 8000// 600; // minutes

exports.GOOGLE_AUTHENTICATOR_LABEL = "OVAuthen";
exports.SOCKET_SECRETE_KEY = "5ed7e06b8e95fc849c09ee7158277dc9693e3879536d44ee27c4d833";

exports.tokenAPI = {
    method: 'POST',
    url: 'https://idp.eton.vn/connect/token/',
    ContentType: 'application/x-www-form-urlencoded',
    grant_type: 'password',
    client_id: 'opsdashboard',
    client_secret: '48ka5RNjBdiFTykdLR',
    scope: 'openid profile etoninfo etonopswebapp etonadminservice idmgr etonopsservice offline_access'
};
exports.dataAPI = {
    method: 'POST',
        url: 'https://ccp.eton.vn/opsp/api/v0.1/SO/GetSoByShippingServices',
        ContentType: 'application/json',
        body: { "ShippingServiceCodes": ["D2H"] }
};
