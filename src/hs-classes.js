/*global module,require*/

var WebSocket = require("ws");

var Homeseer = function(host) {
    var hs = this;
    this._ws = new WebSocket(host);
    this._ws.on('open', function() { hs._onWsOpen.call(hs); });
    this._ws.on('message', function(msg, flags) { hs._onWsMessage.call(hs, msg, flags); });
    this._ws.on('close', function() { hs._onWsClose.call(hs); });
    this._ws.on('error', function(err) { hs._onWsError.call(hs, err); });
};

Homeseer.prototype = {
    devices: function(cb) {
        this._request("devices", undefined, cb);
    },
    on: function(type, cb) {
        this._ons[type] = cb;
    },
    shutdown: function() {
        this._ws.close();
    },

    _ws: undefined,
    _id: 0,
    _ons: Object.create(null),
    _cbs: Object.create(null),
    _request: function(name, args, cb) {
        var req = { type: name, id: ++this._id };
        if (args !== undefined)
            req.args = args;
        this._cbs[req.id] = cb;
        this._ws.send(JSON.stringify(req));
    },
    _callOn: function(type, arg) {
        if (type in this._ons) {
            var cb = this._ons[type];
            return cb(arg);
        }
        return undefined;
    },
    _onWsOpen: function() {
        this._callOn("ready");
    },
    _onWsClose: function() {
    },
    _onWsMessage: function(msg, flags) {
        try {
            var data = JSON.parse(msg);
        } catch (e) {
            console.error(e);
            return;
        }
        //console.log(data);
        if (data.hasOwnProperty("id")) {
            if (data.hasOwnProperty("type") && data.hasOwnProperty("data")) {
                if (data.type === "request") {
                    // special
                    //console.log("got req", data);
                    // var obj = {
                    //     data: data.data
                        // write: function(data) {
                        //     var response = {
                        //         id: this._id,
                        //         type: "response",
                        //         data: data
                        //     };
                        //     console.log("sending resp", response);
                        //     this._ws.send(JSON.stringify(response));
                        // }
                    // };
                    var ret = this._callOn("request", data.data);
                    if (ret !== undefined) {
                        var resp = { id: data.id, type: "response", data: ret };
                        //console.log("sending resp", resp);
                        this._ws.send(JSON.stringify(resp));
                    }
                    return;
                }
            }
            if (data.id in this._cbs) {
                var cb = this._cbs[data.id];
                delete this._cbs[data.id];
                cb(data);
            }
        }
    },
    _onWsError: function(err) {
        console.error("WS error: " + err);
    }
};

var Device = function() {
};

module.exports = { Device: Device, Homeseer: Homeseer };
