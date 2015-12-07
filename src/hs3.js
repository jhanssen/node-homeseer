/*global process,readline,require*/

var classes = require("./hs-classes.js");

var hs = new classes.Homeseer("ws://pi.nine.ms:8087/homeseer");
hs.on("ready", function() {
    hs.devices(function(devs) {
        console.log("DEVS", devs);
    });
});
hs.on("request", function(req) {
    var p, k, cmd = req.command;
    if (cmd) {
        switch (cmd.function) {
        case "triggerCount":
            return { value: 1};
        case "triggerName":
            return { value: "foobar" };
        case "triggerConfigured":
            var cfg = (cmd.arguments.length > 0 && cmd.arguments[0].length > 0);
            return { value: cfg };
        case "triggerFormatUI":
            p = undefined;
            try {
                p = JSON.parse(cmd.arguments[0]);
            } catch (e) {
                console.log(e);
            }
            for (k in p) {
                if (k.indexOf("foobarui") === 0) {
                    return { value: p[k] };
                }
            }
            console.log("no formatui for", cmd.arguments);
            break;
        case "triggerBuildUI":
            p = {};
            try {
                if (cmd.arguments.length > 0 && cmd.arguments[0].length > 0)
                    p = JSON.parse(cmd.arguments[0]);
            } catch (e) {
                console.log(e);
            }
            var selected;
            for (k in p) {
                if (k.indexOf("foobarui") === 0)
                    selected = p[k];
            }
            var ui = {
                name: "foobarui",
                description: "Hello world:",
                type: "jqDropList",
                items: [
                    { name: "--Please select--", value: "-1", selected: selected === undefined },
                    { name: "name", value: "value", selected: selected === "value" },
                    { name: "name2", value: "value2", selected: selected === "value2" }
                ],
                postback: true
            };
            return { value: ui };
        case "triggerProcessPostUI":
            console.log("post for", cmd.arguments);
            if (cmd.arguments.length !== 2)
                return "";
            var prev = {};
            if (cmd.arguments[1].length > 0) {
                try {
                    prev = JSON.parse(cmd.arguments[1]);
                } catch (e) {
                    console.error(e);
                }
            }
            for (k in cmd.arguments[0]) {
                prev[k] = cmd.arguments[0][k];
            }
            console.log("posted", JSON.stringify(prev));
            return { value: JSON.stringify(prev) };
        default:
            console.log("unknown function " + cmd.function);
            break;
        }
    }
    //console.log(cmd);
    return undefined;
});

process.on('SIGINT', function() {
    hs.shutdown();
    process.exit();
});
