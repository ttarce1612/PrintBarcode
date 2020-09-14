/**
 * Copyright (c) 2019 OVTeam
 * Modified date: 2019/11/11
 * Modified by: Duy Huynh
 */
import OutboundModule from ".";

function getConfig() {
    return [
        {path: "/outbounds", component: OutboundModule},
    ]
}
export {
    getConfig
}