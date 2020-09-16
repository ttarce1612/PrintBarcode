/**
 * Copyright (c) 2019 OVTeam
 * Modified by: Huy Nghiem
 * Modified date: 2019/02/03
 */
let router = require("express").Router();
// let orderController = require("./orders/orderController");
let inboundController = require("./inbound/inboundController");
let outboundController = require("./outbound/outboundController");
let orderController = require("./orders/orderController");
let serialPrintController = require("./serialPrint/serialPrintController")
let barcodePrintController = require("./barcodePrint/barcodePrintController")

const logger = require('./../lib/logger');
let _authCookie = require("../lib/authCookie");

router.use(function (req, res, next) {
    try {
        //Logging request
        logging(req);

        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

        // Barcode Printer Controller
        router.route("/barcodeprint/searchbysku").post(barcodePrintController.searchBySku);
        router.route("/barcodeprint/updatebarcode").post(barcodePrintController.updateBarcode);


        // Serial Printer Controller
        router.route("/serialprint/print").post(serialPrintController.createUniqueStringList);
        router.route("/serialprint/searchbyclient").post(serialPrintController.searchByClient);
        router.route("/serialprint/getlist").get(serialPrintController.getList);
        router.route("/serialprint/getlast").get(serialPrintController.getLast);  
        //ORDERS
        router.route("/orders").get(orderController.getList);
        router.route("/order/update").post(orderController.updateOrder);

        // Controller inboundController
        router.route("/inbounds").get(inboundController.getList);
        router.route("/inbound/:id").get(inboundController.getOne);
        router.route("/inbound/create").post(inboundController.createInbound);
        router.route("/inbound/update").post(inboundController.updateInbound);

        // Controller outboundController
        router.route("/outbounds").get(outboundController.getList);
        router.route("/outbound/:id").get(outboundController.getOne);
        router.route("/outbound/create").post(outboundController.createOutbound);
        router.route("/outbound/update").post(outboundController.updateOutbound);

        next();
    } catch(err) {
        console.log(77777, err)
    }
});

//Log data to elasticsearch
async function logging(req) {
    let ip = (req.headers['x-forwarded-for'] || '').split(',').pop() || req.connection.remoteAddress ||
        req.socket.remoteAddress || req.connection.socket.remoteAddress;

    let _data = {
        uri: 'api' + req._parsedUrl.pathname,
        ip: ip || "",
        method: req.method,
        headers: JSON.stringify(req.headers),
        data: JSON.stringify({ body: req.body, query: req.query, params: req.params }),
        username: (req.headers.cookie) ? _authCookie.getTopSecret(req) : '',
        createdate: new Date()
    };
    logger.insert(_data, APP_NAME.toLowerCase() + '_' + 'request');
}

module.exports = router;