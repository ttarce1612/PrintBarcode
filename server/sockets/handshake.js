const SECRET_CODE = "LFHUYWJNK5CTCOCR";
let _nsp = null;

function initHandle(socket) {
    //Receiver data from sender
    socket.on("sender", function(data) {
        let sharedcode = this.sharedcode;
        //Send to client
        if(sharedcode) {
            _nsp.to(sharedcode).emit('receiver', data);
        }
    });
}

function initHandshakeSocket() {
    _nsp.on("connection", function(socket) {
        //code + room
        let sharedcode = _socket.handshake.query.sharedcode||"";
        //let authcode = _socket.handshake.query.authcode||"";
        if(!sharedcode /*|| !checkHandshake(authcode)*/) {
            socket.emit("on_state", "Deny access.");
            socket.leaveAll();
            socket.disconnect(true);
        } else {
            socket.sharedcode = sharedcode;
            socket.join(sharedcode);
            initHandle(socket);
        }
    });    
}

/**
 * Check handshake
 * @param {*} code 
 */
function checkHandshake(code) {
    let GA = require('otp.js').googleAuthenticator;
    try
    {
        return GA.verify(code, SECRET_CODE);
    }
    catch(ex)
    {
        return false;
    }
}

/**
 * Initial Handshake socket
 */
exports.init = function(socketEngine) {
    if(socketEngine) {
        _nsp = socketEngine.nsp('/handshake');;
        initHandshakeSocket();
    }
}



