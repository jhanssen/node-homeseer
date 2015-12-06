/*global module,require*/

var WebSocket = require("ws");

var Homeseer = function(host) {
    this._ws = new WebSocket(host);
    this._ws.on('open', this._onWsOpen);
    this._ws.on('message', this._onWsMessage);
    this._ws.on('close', this._onWsClose);
};

Homeseer.prototype = {
    devices: function(cb) {
        this._request("devices", cb);
    },

    _ws: undefined,
    _id: 0,
    _ons: Object.create(null),
    _request: function(name, cb) {
        var req = { type: name, id: ++this._id };
        this._ws.send(JSON.stringify(req));
    },
    _onWsOpen: function() {
    },
    _onWsClose: function() {
    },
    _onWsMessage: function(msg, flags) {
        try {
            var data = JSON.parse(msg.data);
        } catch (e) {
            console.error(e);
            return;
        }
        console.log(data);
    }
};

var Device = function() {
};

module.exports = { Device: Device };
