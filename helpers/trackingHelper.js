"use strict";
var request = require("superagent");
var knownTrackers = require('../trackers.json');
var Tracking = (function () {
    function Tracking(config, context) {
        this.config = config;
        this.context = context;
    }
    Tracking.prototype.checkMail = function (mail, token) {
        var _this = this;
        this.context.log("INFO: Checking mail with SubscriptionId > ", mail.subscriptionId);
        return new Promise(function (resolve, reject) {
            var resource = mail.resource;
            var reqUrl = "https://graph.microsoft.com/v1.0/" + resource;
            request
                .get(reqUrl)
                .set({
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": "Bearer " + token
            })
                .end(function (error, response) {
                if (error || !response.ok) {
                    _this.context.log('ERROR: There was an error checking the mail.');
                    _this.context.log(JSON.stringify(response.body));
                    resolve(error);
                    return;
                }
                _this.context.log("INFO: Retrieved mail content");
                var result = response.body;
                if (result) {
                    var bodyHtml_1 = result.body.content;
                    var tracking_1 = false;
                    var trackingNames_1 = [];
                    if (typeof result.categories !== 'undefined') {
                        trackingNames_1 = result.categories;
                        if (trackingNames_1.indexOf("Tracked") !== -1) {
                            resolve(null);
                            return;
                        }
                    }
                    trackingNames_1.unshift("Tracked");
                    knownTrackers.trackers.forEach(function (tracker) {
                        if (bodyHtml_1.indexOf(tracker.url) !== -1) {
                            tracking_1 = true;
                            trackingNames_1.push(tracker.name);
                        }
                    });
                    if (tracking_1) {
                        _this.context.log("INFO: Mail is tracked, adding tracking categories");
                        request
                            .patch(reqUrl)
                            .set({
                            "Content-Type": "application/json",
                            "Accept": "application/json",
                            "Authorization": "Bearer " + token
                        })
                            .send(JSON.stringify({
                            categories: trackingNames_1
                        }))
                            .end(function (error, response) {
                            if (error || !response.ok) {
                                _this.context.log('ERROR: There was a problem patching the mail.');
                                _this.context.log(JSON.stringify(response.body));
                                resolve(error);
                            }
                            else {
                                resolve(null);
                            }
                        });
                    }
                    else {
                        console.log("INFO: Nothing to do for this mail: " + mail.subscriptionId);
                        resolve(null);
                    }
                }
                else {
                    _this.context.log("ERROR: With retrieving the mail.");
                    resolve(null);
                }
            });
        });
    };
    return Tracking;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Tracking;

//# sourceMappingURL=../maps/helpers/trackingHelper.js.map
