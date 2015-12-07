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
    addDevices: function(devs, cb) {
        this._request("addDevices", devs, cb);
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
        } else if (data.hasOwnProperty("type") && data.hasOwnProperty("data")) {
            if (data.type === "setDeviceValues") {
                console.log("devices updated", data.data);
            }
        }
    },
    _onWsError: function(err) {
        console.error("WS error: " + err);
    }
};

var Device = function() {
};

Device.StatusControl = { Status: 0x1, Control: 0x2 };
Device.Use = { On: 0, Off: 1, Dim: 2, OnAlternate: 3, Play: 4, Pause: 5, Stop: 6,
               Forward: 7, Rewind: 8, Repeat: 10, Shuffle: 11, HeatSetPoint: 12,
               CoolSetPoint: 13, ThermModeOff: 14, ThermModeHeat: 15, ThermModeCool: 16,
               ThermModeAuto: 17, DoorLock: 18, DoorUnlock: 19 };
Device.Render = { Values: 0, SingleTextFromList: 1, ListFromTextList: 2, Button: 3,
                  ValuesRange: 4, ValuesRangeSlider: 5, TextList: 6, TextBoxNumber: 7,
                  TextBoxString: 8, RadioOption: 9, ButtonScript: 10, ColorPicker: 11 };

module.exports = { Device: Device, Homeseer: Homeseer };
