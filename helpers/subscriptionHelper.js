"use strict";
var request = require("superagent");
var subscriptionHelper = (function () {
    function subscriptionHelper(config, context) {
        this.config = config;
        this.context = context;
        this.subConfig = this.config.subscriptionConfig;
    }
    subscriptionHelper.prototype.create = function (token) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.context.log("INFO: Creating a new subscription");
            _this.subConfig.expirationDateTime = _this.getExpirationDate();
            request
                .post(_this.config.adalConfig.subscriptionUrl)
                .set({
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": "Bearer " + token
            })
                .send(JSON.stringify(_this.subConfig))
                .end(function (error, response) {
                if (error || !response.ok) {
                    _this.context.log('ERROR: There was an error creating the subscription.');
                    _this.context.log(JSON.stringify(response.body));
                    reject(error);
                    return;
                }
                var result = response.body;
                if (result) {
                    if (typeof result.id !== "undefined") {
                        _this.context.log("INFO: Subscription created with the following ID > " + result.id);
                    }
                    else {
                        _this.context.log("ERROR: Problem creating the subscription > " + JSON.stringify(result));
                    }
                    resolve(null);
                }
                else {
                    _this.context.log("ERROR: Problem creating the subscription. Body was not defined.");
                    resolve(null);
                }
            });
        });
    };
    subscriptionHelper.prototype.update = function (token) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.context.log("INFO: Updating the existing subscription");
            request
                .patch(_this.config.adalConfig.subscriptionUrl + "/" + _this.config.adalConfig.subscriptionId)
                .set({
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": "Bearer " + token
            })
                .send(JSON.stringify({
                "expirationDateTime": _this.getExpirationDate()
            }))
                .end(function (error, response) {
                if (error || !response.ok) {
                    _this.context.log('ERROR: There was an error updating the subscription.');
                    _this.context.log(JSON.stringify(response.body));
                    reject(error);
                    return;
                }
                var result = response.body;
                if (result) {
                    if (typeof result.id !== "undefined") {
                        _this.context.log("INFO: Subscription updated > " + _this.config.adalConfig.subscriptionId);
                    }
                    else {
                        _this.context.log("ERROR: Problem updating the subscription > " + JSON.stringify(result));
                    }
                    resolve(null);
                }
                else {
                    _this.context.log("ERROR: Problem updating the subscription. Body was not defined.");
                    resolve(null);
                }
            });
        });
    };
    subscriptionHelper.prototype.delete = function (token) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.context.log("INFO: Updating the existing subscription");
            request
                .del(_this.config.adalConfig.subscriptionUrl + "/" + _this.config.adalConfig.subscriptionId)
                .set({
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": "Bearer " + token
            })
                .end(function (error, response) {
                if (error || !response.ok) {
                    _this.context.log('ERROR: There was an error deleting the subscription.');
                    _this.context.log(JSON.stringify(response.body));
                    reject(error);
                    return;
                }
                var result = response.body;
                if (result) {
                    _this.context.log("INFO: Subscription deleted");
                    resolve(null);
                }
                else {
                    _this.context.log("ERROR: Problem deleting the subscription. Body was not defined.");
                    resolve(null);
                }
            });
        });
    };
    subscriptionHelper.prototype.getExpirationDate = function () {
        return new Date(Date.now() + (86400000 * 2.9)).toISOString();
    };
    return subscriptionHelper;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = subscriptionHelper;

//# sourceMappingURL=../maps/helpers/subscriptionHelper.js.map
