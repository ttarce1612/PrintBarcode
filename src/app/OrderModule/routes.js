/**
 * Copyright (c) 2019 OVTeam
 * Modified date: 2020/01/17
 * Modified by: Tri Cao
 */
import OrderModule from "./";

function getConfig() {
    return [
        {path: "/orders", component: OrderModule},
    ]
}
export {
    getConfig
}