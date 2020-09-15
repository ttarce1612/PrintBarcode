/**
 * Copyright (c) 2019 OVTeam
 * Modified date: 2019/11/11
 * Modified by: Duy Huynh
 */
module.exports = {
    LoginModule: {
        module: require('./app/LoginModule/routes'),
        isCheckAuthentication: false
    },
    InboundModule: {
        module: require('./app/InboundModule/routes'),
        isCheckAuthentication: true,
        onlyAdmin: true
    },
    OutboundModule: {
        module: require('./app/OutboundModule/routes'),
        isCheckAuthentication: true,
        onlyAdmin: true
    },
    PrintSerialModule: {
        module: require('./app/PrintSerialModule/routes'),
        isCheckAuthentication: true,
        onlyAdmin: true
    },
    OrderModule: {
        module: require('./app/OrderModule/routes'),
        isCheckAuthentication: true,
        onlyAdmin: true
    },
    PrintBarcodeModule: {
        module: require('./app/PrintBarcodeModule/routes'),
        isCheckAuthentication: true,
        onlyAdmin: true
    },
    
}