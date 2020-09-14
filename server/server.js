/*OVIOT STRUCTURE
 * Author: Onlyvic
 * Email: onlyvicisvic@gmail.com
 * Phone: (+84) 988 099 636
 * 
 * version:
 * 		3.3: 17/02/17 socket =>done, using for dashboard	
 * 		0.3: note: next version need to apply session timeout, role permission(authorization). This version
 * 					we just develop authentication
 * */

//Start process in production mode
if (process.argv.indexOf("--live") != -1) {
    productionMode();
}

/**
 * Production mode
 */
function productionMode() {
    const { port } = require("./config");
    const express = require('express');
    const path = require('path');

    app = express();

    httpServer = app.listen(port, function () {
        console.log("Production Express server running at localhost:" + port)
    });

    init(app, httpServer);

    app.use(express.static(path.join(__dirname, '../build')));
    app.get('*', function (req, res) {
        res.sendFile(path.join(__dirname, '../build', 'index.html'));
    });
}

/**
 * Development mode
 */
function developmentMode(app, httpServer) {
    init(app, httpServer)
}

/**
 * Initial server
 * @param {*} app 
 * @param {*} httpServer 
 */
function init(app, httpServer) {
    let bodyParser = require("body-parser");

    //Load configuration
    require("./config").loadConfigs();

    const authen = require("./lib/authen");
    const connection = require("./lib/connection");
    const routing = require("./routing");

    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
    app.use(bodyParser.json());
    //Enable Logging exception
    logging();

    //Connect to OVGatway
    // require("./lib/gatewayClient").initApp();
    //Register routing
    routing.register(app);
    // Database connection
    connection.init();
    //Register authentication
    authen.register(httpServer);


}

/**
 * Enable logging exception
 */
function logging() {
    const utils = require('./lib/utils');
    process.on('uncaughtException', (err) => {
        console.log("uncaughtException Error:", err)
        utils.logFile('uncaughtException', err);
    });
}

module.exports = { developmentMode: developmentMode };
