/**
 * Copyright (c) 2019 OVTeam
 * Modified date: 2019/11/11
 * Modified by: Duy Huynh
 */
import InboundModule from "./";

function getConfig() {
    return [
        {path: "/inbounds", component: InboundModule},
    ]
}
export {
    getConfig
}