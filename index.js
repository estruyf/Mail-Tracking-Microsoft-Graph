"use strict";
var authHelper_1 = require("./helpers/authHelper");
var subscriptionHelper_1 = require("./helpers/subscriptionHelper");
var trackingHelper_1 = require("./helpers/trackingHelper");
var Tracker = (function () {
    function Tracker(context, config) {
        this._config = config;
        this._context = context;
    }
    Tracker.prototype.init = function (action, body) {
        var _this = this;
        var auth = new authHelper_1.default(this._config);
        auth.getAppOnlyAccessToken().then(function (token) {
            _this._context.log('INFO: Access token retrieved');
            if (action) {
                var subscription = new subscriptionHelper_1.default(_this._config, _this._context);
                _this._context.log("INFO: Current action > " + action);
                switch (action) {
                    case "create":
                        subscription.create(token).then(function () {
                            _this._end({ status: 200, body: "ok" });
                        }).catch(function (error) {
                            _this._end({ status: 200, body: "nok" });
                        });
                        break;
                    case "update":
                        subscription.update(token).then(function () {
                            _this._end({ status: 200, body: "ok" });
                        }).catch(function (error) {
                            _this._end({ status: 200, body: "nok" });
                        });
                        break;
                    case "delete":
                        subscription.delete(token).then(function () {
                            _this._end({ status: 200, body: "ok" });
                        }).catch(function (error) {
                            _this._end({ status: 200, body: "nok" });
                        });
                        break;
                    default:
                        _this._end({ status: 200, body: "ok" });
                        break;
                }
            }
            else {
                if (typeof body !== "undefined") {
                    var track_1 = new trackingHelper_1.default(_this._config, _this._context);
                    var proms_1 = [];
                    body.value.forEach(function (mail) {
                        proms_1.push(track_1.checkMail(mail, token));
                    });
                    Promise.all(proms_1).then(function (data) {
                        _this._end({ status: 202, body: "ok" });
                    }).catch(function (error) {
                        _this._end({ status: 202, body: "nok" });
                    });
                }
                else {
                    _this._end({ status: 202, body: "ok" });
                }
            }
        })
            .catch(function (err) {
            _this._context.log("ERROR: ", JSON.stringify(err));
            _this._end({});
        });
    };
    Tracker.prototype._end = function (res) {
        this._context.done(null, res);
    };
    return Tracker;
}());
module.exports = function (context, req) {
    var config = require('./config.json');
    ;
    console.log('ENV:', process.env.NODE_ENV);
    if (req.query && req.query.validationToken) {
        context.log('INFO: Validation token > ', req.query.validationToken);
        context.done(null, {
            status: 200,
            body: req.query.validationToken
        });
    }
    else {
        if (req.query || req.body) {
            var action = (req.query.action || req.body.action);
            var body = req.body;
            var tracking = new Tracker(context, config);
            tracking.init(action, body);
        }
        else {
            context.done(null, { status: 404, body: "nok" });
        }
    }
};

//# sourceMappingURL=maps/index.js.map
