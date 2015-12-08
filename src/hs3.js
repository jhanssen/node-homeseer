/*global process,readline,require*/

var classes = require("./hs-classes.js");

var hs = new classes.Homeseer("ws://pi.nine.ms:8087/homeseer");
var devs = [];
var Device = classes.Device;

function deviceValueChanged(dev)
{
    console.log("got value " + dev.value);
    dev.text = "ting " + dev.value;
}

hs.on("ready", function() {
    // hs.devices(function(devs) {
    //     console.log("DEVS", devs);
    // });
    hs.addDevices([{
        name: "foobardevice",
        location: "floor",
        location2: "room",
        type: "type",
        address: "test",
        code: "code",
        pairs: [
            {
                status: {
                    //type: "single",
                    value: 0,
                    text: "hello",
                    control: Device.StatusControl.Status,
                    use: Device.Use.On,
                    render: Device.Render.Button,
                    //buttonImage: "",
                    includeValues: false
                },
                graphic: {
                    value: 0,
                    //graphic: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAldJREFUeNrElz1sE0EQhd+e14YLxD8QrIjYshNFSJACRIEoQKJMg0QBFYUdGgoaJCTqq+kpaIhTITooQJRpQIKKAiES8WMriYLiJL74RAz23g47ZydCorX35nRXXPO9ffN2Vith6sGzZVx7eKeSzo55uXymjBFWa2uv3vb3veVHT5ea715B8M83s2cWZy6drRZvXYcsTo+SD7X2A5svXmP17afa/NfVBfGyOFOZu3KuVrh9E+j2EG5vjVRAYiIPpJKo155j5f1KVR4fP+rlL5+HWl8D+S2MuvTuDkQ2h9NXL2Ljc8OTmdxYGaGC3mnCVhGzXBfMlslkAhQEEELAZjGT2TIpHeOLBpnHbgkwW2odgsIQcRSzpQ7N6k0GYhFg2MYBFqBjckD3HUBcLTh0QIVxOkAxZoAgKQphPA5QvwXUF2B/DIDZkvSAbNsFaSYwC4gciM5JZV2APhDAx4DtHIiDFvCHLdDK7jBK0D8CiB2wPAvovxDGMIyiEIYsIAYHmBlGDlA/EdaHETMNe5ABEUMGxCADvAVYQE/bdwDRLhhsyp79FjBb9owKRTrqByzNAnEkGTGZLXsGzGt3jrnmUhJYEeBkUhGT2fIXqO43g/KpqZNQm207U9CwdpsBmJ2YT2f9rt+5cWJ2Em4+A/qjokDSb3M4hTS0VzgOnIlxpOYK2HdT+PLhO/a66n50G3kyVVrMp93q9IUScpNZSBMQ6Qz3oqI0Z43Q+unj28cGttud2t2NxsIh5XGhVEkRPBcom72JxJBt554rQ+sA9a6Ad2+9scT//wowAHwScv0fWHuwAAAAAElFTkSuQmCC"
                    graphic: "images/checkbox_disabled_on.png"
                }
            },
            {
                status: {
                    //type: "range",
                    value: [0, 10],
                    text: { prefix: "pre", suffix: "suff" },
                    control: Device.StatusControl.Status | Device.StatusControl.Control,
                    render: Device.Render.ValuesRangeSlider,
                    includeValues: false
                },
                graphic: {
                    value: [0, 10],
                    graphic: "images/checkbox_on.png"
                }
            }

        ]
    }], function(newdevs) {
        for (var i = 0; i < newdevs.length; ++i) {
            var d = newdevs[i];
            d.on("valueChanged", deviceValueChanged);
            devs.push(d);
        }
        //console.log("devices created!", devs);
        setTimeout(function() { devs[0].value = 3; devs[0].text = "traill"; }, 5000);
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
