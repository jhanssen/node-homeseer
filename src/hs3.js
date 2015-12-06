/*global process,readline,require*/

var classes = require("./hs-classes.js");

var hs = new classes.Homeseer("ws://pi.nine.msg/homeseer");
hs.devices(function(devs) {
    console.log(devs);
});
