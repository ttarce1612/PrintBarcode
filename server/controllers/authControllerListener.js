/**
 * Copyright (c) 2019 OVTeam
 * Modified by: Huy Nghiem
 * Modified date: 2019/02/03
 */
let router = require("express").Router();
let authenController = require("./security/authController");

router.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    //AUTH API
    router.route("/state").post(authenController.authState);
    router.route("/validatesession").post(authenController.validateAuthSession);
    router.route("/signin").post(authenController.authorize);
    router.route("/logout").post(authenController.logout);

    next();
});
module.exports = router;