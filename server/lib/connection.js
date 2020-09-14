
/**
 * Centralize System
 * Modified by: Duy Huynh
 * Modified date: 2020/01
 */

function init() {
    const mongoose = require("mongoose");
    const config = require("./../env_config")

    mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
    mongoose.connection.once('open', function () {
        console.log("connect database successful.")
    });
    mongoose.connect(config['DEFAULT_CONNECTION'], { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
    mongoose.set('useCreateIndex', true);
}

module.exports = {
    init
}