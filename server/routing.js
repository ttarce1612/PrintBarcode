/**
 * Copyright (c) 2019 OVTeam
 * Modified by: Huy Nghiem
 * Modified date: 2019/02/03
 */
exports.register = (app) => {
    app.use("/api/auth", [require("./controllers/authControllerListener")]);
    // app.use("/api", [require('./lib/requestValidator'), require("./controllers/apiControllerListener")]);
    app.use("/api", [require("./controllers/apiControllerListener")]);
    
    //Gateway controller listener
    require("./controllers/gatewayControllerListener").register();
}