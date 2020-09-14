const server = require("./server"); 
let env = "dev";
if(process.argv.indexOf("-env=prod") != -1) {
  env = "prod";
}
if(env == "prod") {
  server.init();
}
module.exports = {
  init: function(instant) {
    server.init(instant.app, instant.listeningApp);
  }
}