/**
 * Copyright (c) 2019 OVTeam
 * Modified by: Huy Nghiem
 * Modified date: 2019/02/03
 */


exports.register = () => {
    //Order API
    require("./inbound/inboundController").registerGatwayListener();
}